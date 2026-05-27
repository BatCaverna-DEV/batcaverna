import xlsx   from 'xlsx'
import multer  from 'multer'
import { Op }  from 'sequelize'
import Diario  from '../models/Diario.js'
import Turma   from '../models/Turma.js'
import Curso   from '../models/Curso.js'
import Calendario from '../models/Calendario.js'

/** Arquivo em memória — sem gravar em disco */
export const upload = multer({ storage: multer.memoryStorage() })

/**
 * Extrai nome e carga horária de uma string de componente curricular.
 *
 * Exemplos de entrada:
 *   "TEC.07282 - Física I - Técnico [67 h/80 Aulas]  [Matriz 1191]"
 *   "TEC.03644 - Arte II - Técnico [33 h/40 Aulas] - - [Matriz 1191]"
 *
 * Retorna: { nome: "Física I", carga: 67 }
 */
function parseComponente(raw) {
    if (!raw) return null
    const str = raw.toString().trim()

    // Extrai carga: primeiro número dentro de "[N h/"
    const horasMatch = str.match(/\[(\d+)\s*h\//i)
    const carga = horasMatch ? parseInt(horasMatch[1]) : 0

    // Nome é o segundo segmento ao dividir por " - "
    const partes = str.split(' - ')
    const nome = (partes.length >= 2 ? partes[1] : str).trim()

    return { nome: nome.substring(0, 100), carga }
}

/**
 * Gera descrição legível a partir do código da turma.
 * "20261.1.TDS.CNT.1191.1N" → "1° Período – Noturno"
 */
function parseTurmaDescricao(codigo) {
    const partes = codigo.split('.')
    const ultimo = partes[partes.length - 1]          // ex: "1N", "1M", "1V"
    const periodo = ultimo.replace(/[A-Z]/gi, '')      // ex: "1"
    const turno   = ultimo.replace(/\d/g, '').toUpperCase() // ex: "N"
    const turnos  = { M: 'Matutino', V: 'Vespertino', N: 'Noturno' }
    return `${periodo}° Período – ${turnos[turno] ?? turno}`
}

class ImportarController {

    /**
     * POST /diario/importar
     * Recebe arquivo XLS/XLSX e cria turmas + diários automaticamente.
     * Protegido por auth + ehGestor.
     */
    importar = async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado.' })
        }

        try {
            // ── 1. Curso do coordenador logado ─────────────────────────────────
            const curso = await Curso.findOne({
                where: { professor_id: req.userProfessorId, status: 1 }
            })
            if (!curso) {
                return res.status(403).json({
                    message: 'Você não está vinculado como coordenador a nenhum curso ativo.'
                })
            }

            // ── 2. Ler arquivo ─────────────────────────────────────────────────
            const wb   = xlsx.read(req.file.buffer, { type: 'buffer' })
            const ws   = wb.Sheets[wb.SheetNames[0]]
            const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null })

            // Pula o cabeçalho (linha 0) e linhas sem turma/componente
            const data = rows.slice(1).filter(r => r[1] && r[2])
            if (!data.length) {
                return res.status(400).json({ message: 'Arquivo vazio ou sem dados válidos.' })
            }

            // ── 3. Calendário ativo: cobre a data de hoje; se nenhum, o mais recente ──
            const hoje = new Date().toISOString().slice(0, 10)   // "YYYY-MM-DD"

            let calendario = await Calendario.findOne({
                where: { status: 1, inicio: { [Op.lte]: hoje }, fim: { [Op.gte]: hoje } },
                order: [['inicio', 'DESC']],
            })

            if (!calendario) {
                // Nenhum cobre hoje — usa o mais recente cadastrado
                calendario = await Calendario.findOne({
                    where: { status: 1 },
                    order: [['inicio', 'DESC']],
                })
            }

            if (!calendario) {
                return res.status(404).json({
                    message: 'Nenhum calendário acadêmico cadastrado. Cadastre-o antes de importar.'
                })
            }

            // ── 4. Iterar linhas e criar turmas + diários ──────────────────────
            const turmaMap = new Map() // codigo → instância Turma
            const result = {
                turmasCriadas:     0,
                turmasExistentes:  0,
                diariosCriados:    0,
                diariosExistentes: 0,
                erros:             [],
            }

            for (const row of data) {
                const turmaCodigo   = row[1]?.toString().trim()
                const componenteRaw = row[2]?.toString().trim()

                if (!turmaCodigo || !componenteRaw) continue

                // ── Turma ──────────────────────────────────────────────────────
                if (!turmaMap.has(turmaCodigo)) {
                    const [turma, criada] = await Turma.findOrCreate({
                        where:    { codigo: turmaCodigo },
                        defaults: {
                            codigo:        turmaCodigo,
                            descricao:     parseTurmaDescricao(turmaCodigo),
                            status:        1,
                            curso_id:      curso.id,
                            calendario_id: calendario.id,
                        },
                    })
                    turmaMap.set(turmaCodigo, turma)
                    criada ? result.turmasCriadas++ : result.turmasExistentes++
                }

                const turma = turmaMap.get(turmaCodigo)

                // ── Diário ─────────────────────────────────────────────────────
                const parsed = parseComponente(componenteRaw)
                if (!parsed || !parsed.carga) {
                    result.erros.push(`Linha ignorada — carga não identificada: "${componenteRaw}"`)
                    continue
                }

                const hsPorAula    = curso.categoria === 1 ? 40 : 20
                const aulas_semana = Math.round(parsed.carga / hsPorAula)

                const [, criado] = await Diario.findOrCreate({
                    where:    { turma_id: turma.id, descricao: parsed.nome },
                    defaults: {
                        descricao:   parsed.nome,
                        carga:       parsed.carga,
                        turma_id:    turma.id,
                        codigo:      curso.categoria,
                        status:      1,
                        ministrada:  0,
                        aulas_semana,
                    },
                })
                criado ? result.diariosCriados++ : result.diariosExistentes++
            }

            return res.status(200).json({
                message: 'Importação concluída.',
                calendario: `${calendario.ano}.${calendario.semestre}`,
                curso: curso.descricao,
                ...result,
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new ImportarController()
