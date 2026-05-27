/**
 * migrar.js — Importa os arquivos Excel para o banco de dados.
 *
 * Pré-requisito: execute `npm run db:sync` antes para criar as tabelas.
 *
 * Uso:
 *   npm run db:migrar          → inserção incremental (pula duplicatas)
 *   npm run db:migrar:limpar   → ⚠️  apaga os dados existentes e reimporta
 *
 * Configurações editáveis:
 *   SIAPE_COORDENADOR  → SIAPE do coordenador do curso (receberá categoria 2)
 *   CALENDARIO         → Datas do semestre letivo
 *   CURSO_ADS          → Descrição do curso a ser criado
 */

import { readFileSync }          from 'fs'
import { resolve, dirname }      from 'path'
import { fileURLToPath }         from 'url'
import XLSX                      from 'xlsx'
import banco                     from './banco.js'
import Professor                 from '../models/Professor.js'
import Usuario                   from '../models/Usuario.js'
import Calendario                from '../models/Calendario.js'
import Curso                     from '../models/Curso.js'
import Turma                     from '../models/Turma.js'
import Diario                    from '../models/Diario.js'

// ── Caminhos ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '../../')   // raiz do projeto (onde ficam os .xls)

// ── Configurações ─────────────────────────────────────────────────────────────

/** SIAPE do professor coordenador — receberá categoria 2 (acesso admin) */
const SIAPE_COORDENADOR = '1226388'   // Bruno Vicente Alves de Lima

/** Calendário letivo a ser criado (ajuste as datas se necessário) */
const CONFIG_CALENDARIO = {
    descricao: '2026.1 — Semestre Letivo',
    ano:       2026,
    semestre:  1,
    inicio:    '2026-02-03',
    fim:       '2026-06-27',
    status:    1,
}

/** Curso principal ao qual todas as turmas serão vinculadas */
const CONFIG_CURSO = {
    descricao: 'Tecnologia em Análise e Desenvolvimento de Sistemas',
    status:    1,
}

// ── Helpers de log ────────────────────────────────────────────────────────────

const ok   = (msg) => console.log(`  ✔  ${msg}`)
const warn = (msg) => console.warn(`  ⚠  ${msg}`)
const erro = (msg) => console.error(`  ✖  ${msg}`)
const info = (msg) => console.log(`     ${msg}`)
const sep  = ()    => console.log('─'.repeat(58))

// ── Helpers de dados ──────────────────────────────────────────────────────────

/** Lê a primeira aba de um arquivo Excel e retorna array de objetos */
function lerExcel(caminho) {
    const wb = XLSX.read(readFileSync(caminho))
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null })
}

/**
 * Extrai código numérico, descrição e carga horária do campo
 * COMPONENTE CURRICULAR.
 * Exemplo de entrada:
 *   "SUP.06277 - Programação Orientada a Objetos - Superior [60 h/80 Aulas]  [Matriz 917]"
 */
function parsearComponente(texto) {
    const re = /SUP\.(\d+)\s*-\s*(.+?)\s*-\s*Superior\s*\[(\d+)\s*h/i
    const m  = texto.match(re)
    if (!m) return { codigo: 0, descricao: texto.slice(0, 100), carga: 0 }
    return {
        codigo:   parseInt(m[1]),
        descricao: m[2].trim().slice(0, 100),
        carga:    parseInt(m[3]),
    }
}

/** Normaliza string para comparação: remove acentos e converte para minúsculas */
function normalizar(s) {
    return (s ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
}

/**
 * Localiza um professor pelo nome parcial (como aparece na coluna NOMES PROFESSORES
 * dos diários). Verifica se TODAS as palavras do nome parcial estão contidas
 * no nome completo do professor (comparação sem acentos).
 */
function buscarProfessor(nomeParcial, professores) {
    const palavras = normalizar(nomeParcial).split(/\s+/)
    return professores.find(p => {
        const nomeNorm = normalizar(p.nome)
        return palavras.every(palavra => nomeNorm.includes(palavra))
    }) ?? null
}

// ── Limpeza de dados ──────────────────────────────────────────────────────────

async function limparDados() {
    console.log(' ⚠️   Modo --limpar: removendo dados existentes...')
    // Ordem inversa às dependências de FK
    await Diario.destroy({ where: {} })
    await Turma.destroy({ where: {} })
    await Curso.destroy({ where: {} })
    await Calendario.destroy({ where: {} })
    await Usuario.destroy({ where: {} })
    await Professor.destroy({ where: {} })
    ok('Todos os dados removidos.')
}

// ── Migração principal ────────────────────────────────────────────────────────

async function migrar() {

    const limpar = process.argv.includes('--limpar')

    sep()
    console.log(' 🦇  Batcaverna — Migração de Dados (Excel → Banco)')
    sep()

    // Lê os três arquivos Excel
    console.log(' 📂  Lendo arquivos Excel...')
    const rowsProfessores = lerExcel(resolve(ROOT, 'professores.xls'))
    const rowsTurmas      = lerExcel(resolve(ROOT, 'turmas.xls'))
    const rowsDiarios     = lerExcel(resolve(ROOT, 'diarios.xls'))
    ok(`${rowsProfessores.length} professor(es) | ${rowsTurmas.length} turma(s) | ${rowsDiarios.length} diário(s)`)
    sep()

    if (limpar) {
        await limparDados()
        sep()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 1 — Professores e Usuários
    // ─────────────────────────────────────────────────────────────────────────
    console.log(' 👨‍🏫  FASE 1 — Professores e Usuários')
    sep()

    const mapSiapeProf = {}   // siape (string) → instância de Professor
    let criadosProfessores = 0
    let existentesProfessores = 0

    for (const row of rowsProfessores) {
        const siape = String(row['Matrícula'] ?? '').trim()
        const nome  = String(row['Nome']      ?? '').trim()
        const email = String(row['E-mail']    ?? '').trim()

        if (!siape || !nome || !email) {
            warn(`Linha ignorada (dados incompletos): #${row['#']} — ${nome}`)
            continue
        }

        const [professor, criado] = await Professor.findOrCreate({
            where:    { siape },
            defaults: { nome, siape, email, status: 1 },
        })

        mapSiapeProf[siape] = professor

        if (criado) {
            await Usuario.findOrCreate({
                where:    { professor_id: professor.id },
                defaults: {
                    username:     siape,
                    password:     null,
                    categoria:    1,     // professor padrão — sem acesso ao sistema
                    status:       1,
                    professor_id: professor.id,
                },
            })
            criadosProfessores++
            ok(`${nome} (${siape})`)
        } else {
            existentesProfessores++
        }
    }

    ok(`${criadosProfessores} criado(s), ${existentesProfessores} já existia(m).`)

    // Promove o coordenador para categoria 2 (acesso admin ao sistema)
    const profCoordenador = mapSiapeProf[SIAPE_COORDENADOR]
    if (profCoordenador) {
        await Usuario.update(
            { categoria: 2 },
            { where: { professor_id: profCoordenador.id } }
        )
        ok(`Coordenador "${profCoordenador.nome}" → categoria 2 (admin).`)
    } else {
        warn(`Coordenador com SIAPE ${SIAPE_COORDENADOR} não encontrado na planilha.`)
    }

    sep()

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 2 — Calendário
    // ─────────────────────────────────────────────────────────────────────────
    console.log(' 📅  FASE 2 — Calendário')
    sep()

    const [calendario, calCriado] = await Calendario.findOrCreate({
        where:    { ano: CONFIG_CALENDARIO.ano, semestre: CONFIG_CALENDARIO.semestre },
        defaults: CONFIG_CALENDARIO,
    })

    ok(`Calendário "${CONFIG_CALENDARIO.descricao}" ${calCriado ? 'criado' : 'já existe'}.`)
    sep()

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 3 — Curso
    // ─────────────────────────────────────────────────────────────────────────
    console.log(' 🎓  FASE 3 — Curso')
    sep()

    if (!profCoordenador) {
        erro(`Coordenador (SIAPE ${SIAPE_COORDENADOR}) não encontrado. Impossível criar Curso.`)
        process.exit(1)
    }

    const [curso, cursoCriado] = await Curso.findOrCreate({
        where:    { descricao: CONFIG_CURSO.descricao, professor_id: profCoordenador.id },
        defaults: { ...CONFIG_CURSO, professor_id: profCoordenador.id },
    })

    ok(`Curso "${curso.descricao}" ${cursoCriado ? 'criado' : 'já existe'}.`)
    ok(`Coordenador: ${profCoordenador.nome}`)
    sep()

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 4 — Turmas
    // ─────────────────────────────────────────────────────────────────────────
    console.log(' 🏫  FASE 4 — Turmas')
    sep()

    const mapCodigoTurma = {}   // codigo (string) → instância de Turma

    for (const row of rowsTurmas) {
        const codigo    = String(row['CODIGO']    ?? '').trim()
        const descricao = String(row['DESCRICAO'] ?? '').trim().slice(0, 100)

        if (!codigo) continue

        const [turma, criada] = await Turma.findOrCreate({
            where:    { codigo },
            defaults: {
                codigo,
                descricao,
                status:        1,
                curso_id:      curso.id,
                calendario_id: calendario.id,
            },
        })

        mapCodigoTurma[codigo] = turma
        ok(`[${criada ? 'CRIADA' : 'EXISTE'}] ${codigo}`)
    }

    sep()

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 5 — Diários
    // ─────────────────────────────────────────────────────────────────────────
    console.log(' 📓  FASE 5 — Diários')
    sep()

    const todosProfessores = Object.values(mapSiapeProf)
    let criadosDiarios     = 0
    let existentesDiarios  = 0
    let errosDiarios       = 0

    for (const row of rowsDiarios) {
        const codigoTurma   = String(row['TURMA']                  ?? '').trim()
        const componente    = String(row['COMPONENTE CURRICULAR']   ?? '').trim()
        const nomeProfessor = String(row['NOMES PROFESSORES']       ?? '').trim()

        const turma = mapCodigoTurma[codigoTurma]
        if (!turma) {
            warn(`Turma "${codigoTurma}" não encontrada → diário ignorado`)
            errosDiarios++
            continue
        }

        const professor = buscarProfessor(nomeProfessor, todosProfessores)
        if (!professor) {
            warn(`Professor "${nomeProfessor}" não encontrado → diário ignorado`)
            errosDiarios++
            continue
        }

        const { codigo, descricao, carga } = parsearComponente(componente)
        const aulas_semana = carga ? Math.round(carga / 20) : 0

        const [, criado] = await Diario.findOrCreate({
            where: {
                codigo,
                turma_id:     turma.id,
                professor_id: professor.id,
            },
            defaults: {
                codigo,
                descricao,
                carga,
                aulas_semana,
                ministrada:   0,
                status:       1,
                turma_id:     turma.id,
                professor_id: professor.id,
            },
        })

        if (!criado) { existentesDiarios++; continue }

        criadosDiarios++
        ok(`${descricao}`)
        info(`└─ Prof: ${professor.nome.split(' ').slice(0, 3).join(' ')}`)
    }

    sep()
    console.log(' ✅  Migração concluída!')
    ok(`Professores:  ${criadosProfessores} criado(s), ${existentesProfessores} já existia(m)`)
    ok(`Diários:      ${criadosDiarios} criado(s), ${existentesDiarios} já existia(m), ${errosDiarios} erro(s)`)
    sep()
}

// ── Execução ──────────────────────────────────────────────────────────────────

migrar()
    .catch(e => {
        erro('Erro inesperado: ' + e.message)
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await banco.sequelize.close()
    })
