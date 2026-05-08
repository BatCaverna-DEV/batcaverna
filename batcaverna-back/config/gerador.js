/**
 * gerador.js — Sincroniza os Models com o banco de dados e cria as tabelas.
 *
 * Modos de execução:
 *   node config/gerador.js           → cria tabelas que não existem (seguro)
 *   node config/gerador.js --alter   → ajusta colunas existentes sem apagar dados
 *   node config/gerador.js --force   → ⚠️  APAGA e recria todas as tabelas
 */

import banco from './banco.js'

// ── Models na ordem correta de dependência de FK ──────────────────────────────
// Nível 0 — sem dependências
import Professor  from '../models/Professor.js'
import Calendario from '../models/Calendario.js'

// Nível 1 — dependem de Professor ou Calendário
import Usuario    from '../models/Usuario.js'
import Curso      from '../models/Curso.js'
import Dia        from '../models/Dia.js'

// Nível 2 — depende de Curso + Calendário
import Turma      from '../models/Turma.js'

// Nível 3 — depende de Professor + Turma
import Diario     from '../models/Diario.js'

// Nível 4 — depende de Diario + Dia
import Horario    from '../models/Horario.js'

// ── Leitura dos flags da linha de comando ─────────────────────────────────────
const args  = process.argv.slice(2)
const force = args.includes('--force')
const alter = args.includes('--alter')

// ── Mapa de models em ordem de criação ───────────────────────────────────────
const models = [
    { model: Professor,  nome: 'professores'  },
    { model: Calendario, nome: 'calendarios'  },
    { model: Usuario,    nome: 'usuarios'     },
    { model: Curso,      nome: 'cursos'       },
    { model: Dia,        nome: 'dias'         },
    { model: Turma,      nome: 'turmas'       },
    { model: Diario,     nome: 'diarios'      },
    { model: Horario,    nome: 'horarios'     },
]

// ── Helpers de log ────────────────────────────────────────────────────────────
const ok  = (msg) => console.log(`  ✔  ${msg}`)
const err = (msg) => console.error(`  ✖  ${msg}`)
const sep = ()    => console.log('─'.repeat(52))

// ── Execução principal ────────────────────────────────────────────────────────
async function sincronizar() {

    sep()
    console.log(' 🦇  Batcaverna — Sincronização de Banco de Dados')
    sep()

    if (force) {
        console.log(' ⚠️   Modo --force ativado: tabelas serão RECRIADAS!')
    } else if (alter) {
        console.log(' 🔧  Modo --alter ativado: colunas serão ajustadas.')
    } else {
        console.log(' 🛡️   Modo padrão: apenas cria tabelas inexistentes.')
    }

    sep()

    const opcoes = { force, alter: !force && alter }

    let sucesso = 0
    let falhas  = 0

    for (const { model, nome } of models) {
        try {
            await model.sync(opcoes)
            ok(`${nome}`)
            sucesso++
        } catch (e) {
            err(`${nome} → ${e.message}`)
            falhas++
        }
    }

    sep()
    console.log(` ✅  Concluído: ${sucesso} tabela(s) sincronizada(s), ${falhas} falha(s).`)
    sep()

}

sincronizar()
    .catch((e) => {
        err('Erro inesperado: ' + e.message)
        process.exit(1)
    })
    .finally(async () => {
        await banco.sequelize.close()
    })
