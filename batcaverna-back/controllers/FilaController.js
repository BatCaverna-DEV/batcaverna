import Fila      from '../models/Fila.js'
import Professor from '../models/Professor.js'
import Motivo    from '../models/Motivo.js'
import Calendario from '../models/Calendario.js'

function semKey(ano, semestre) {
    return `${ano}.${semestre}`
}

function semOrdem(s) {
    if (!s) return 0
    const [y, n] = s.split('.').map(Number)
    return y * 10 + n
}

class FilaController {

    listar = async (req, res) => {
        try {
            const [registros, motivosDb, todosProfessores] = await Promise.all([
                Fila.findAll({
                    include: [
                        { model: Professor, as: 'professor', attributes: ['nome'], where: { status: 1 }, required: true },
                        { model: Calendario, as: 'calendario', attributes: ['ano', 'semestre'] },
                    ],
                }),
                Motivo.findAll({
                    where: { status: 1 },
                    attributes: ['descricao'],
                    order: [['descricao', 'ASC']],
                }),
                Professor.findAll({
                    where: { status: 1 },
                    attributes: ['nome'],
                }),
            ])

            const horariosRuins = motivosDb.map(m => m.descricao)

            // Semestres únicos ordenados cronologicamente
            const semestresSet = new Set()
            for (const r of registros) {
                semestresSet.add(semKey(r.calendario.ano, r.calendario.semestre))
            }
            const semestres   = [...semestresSet].sort((a, b) => semOrdem(a) - semOrdem(b))
            const semestreAtual = semestres.at(-1) ?? ''

            // Agrupa registros por professor, construindo o histórico
            const mapa = {}
            for (const r of registros) {
                const nome = r.professor.nome
                if (!mapa[nome]) {
                    mapa[nome] = { nome, historico: Object.fromEntries(semestres.map(s => [s, false])) }
                }
                mapa[nome].historico[semKey(r.calendario.ano, r.calendario.semestre)] = true
            }

            // Professores ativos sem nenhum registro na fila
            const nomesNaFila = new Set(Object.keys(mapa))
            for (const prof of todosProfessores) {
                if (!nomesNaFila.has(prof.nome)) {
                    mapa[prof.nome] = {
                        nome: prof.nome,
                        historico: Object.fromEntries(semestres.map(s => [s, false])),
                    }
                }
            }

            // Calcula ultimaVez (último semestre em que aparece na fila)
            const professores = Object.values(mapa).map(p => ({
                ...p,
                ultimaVez: semestres.filter(s => p.historico[s]).at(-1) ?? null,
            }))

            // Quem ficou há mais tempo vem primeiro
            professores.sort((a, b) => semOrdem(a.ultimaVez) - semOrdem(b.ultimaVez))

            // Quem está servindo este semestre não recebe número de posição
            let pos = 1
            for (const p of professores) {
                p.posicao = p.historico[semestreAtual] ? null : pos++
            }

            return res.status(200).json({ semestres, semestreAtual, horariosRuins, professores })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new FilaController()
