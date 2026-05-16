import xlsx from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SEMESTRES      = ['2023.1', '2023.2', '2024.1', '2024.2', '2025.1', '2025.2', '2026.1']
const SEMESTRE_ATUAL = '2026.1'
const HORARIOS_RUINS = ['Segunda - 07:00', 'Sexta - 18:00', 'Sexta - Noite', 'Três Noites']

function parsearUltimaVez(valor) {
    if (!valor) return null
    if (typeof valor === 'string') return valor
    if (valor instanceof Date) {
        // Convenção do xlsx: mês 1 → semestre 1, mês 2 → semestre 2
        return `${valor.getFullYear()}.${valor.getMonth() + 1}`
    }
    return null
}

function semOrdem(s) {
    if (!s) return 0
    const [y, n] = s.split('.').map(Number)
    return y * 10 + n
}

class FilaController {

    /**
     * GET /fila
     * Retorna a fila de horários ruins com histórico por semestre.
     * Rota pública — sem autenticação.
     */
    listar = (req, res) => {
        try {
            const filePath = path.join(__dirname, '..', 'fila.xlsx')
            const wb = xlsx.readFile(filePath, { cellDates: true })
            const ws = wb.Sheets['FILA']
            const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null })

            const professores = []
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i]
                if (!row[0] || typeof row[0] !== 'string' || !row[0].trim()) break

                const historico = {}
                SEMESTRES.forEach((sem, idx) => {
                    historico[sem] = row[idx + 1] === 'X'
                })

                professores.push({
                    nome:      row[0].trim(),
                    historico,
                    ultimaVez: parsearUltimaVez(row[8]),
                })
            }

            // Ascending: quem ficou há mais tempo → primeiro da fila
            professores.sort((a, b) => semOrdem(a.ultimaVez) - semOrdem(b.ultimaVez))

            // Quem está servindo este semestre não tem posição numérica
            let pos = 1
            for (const p of professores) {
                p.posicao = p.historico[SEMESTRE_ATUAL] ? null : pos++
            }

            return res.status(200).json({
                semestres:    SEMESTRES,
                semestreAtual: SEMESTRE_ATUAL,
                horariosRuins: HORARIOS_RUINS,
                professores,
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new FilaController()
