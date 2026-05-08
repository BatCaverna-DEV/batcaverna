import Diario    from '../models/Diario.js'
import Professor from '../models/Professor.js'
import Turma     from '../models/Turma.js'
import Curso     from '../models/Curso.js'
import Calendario from '../models/Calendario.js'

class PainelController {

    /**
     * GET /painel/demanda
     * Retorna todas as turmas com seus diários e professores atribuídos.
     * Rota pública — sem autenticação.
     */
    demanda = async (req, res) => {
        try {
            const diarios = await Diario.findAll({
                where: { status: 1 },
                include: [
                    {
                        model: Professor,
                        as: 'professor',
                        required: false,          // LEFT JOIN → diários sem professor aparecem
                    },
                    {
                        model: Turma,
                        as: 'turma',
                        include: [
                            { model: Curso,      as: 'curso' },
                            { model: Calendario, as: 'calendario' },
                        ],
                    },
                ],
                order: [['codigo', 'ASC']],
            })

            // Agrupa por turma mantendo a ordem de inserção
            const turmaMap = new Map()
            for (const d of diarios) {
                const tid = d.turma.id
                if (!turmaMap.has(tid)) {
                    turmaMap.set(tid, { ...d.turma.toJSON(), diarios: [] })
                }
                turmaMap.get(tid).diarios.push(d)
            }

            return res.status(200).json([...turmaMap.values()])
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * GET /painel/professor/:siape
     * Identifica um professor pelo SIAPE.
     * Rota pública — sem autenticação.
     */
    identificar = async (req, res) => {
        try {
            const professor = await Professor.findOne({
                where: { siape: req.params.siape, status: 1 },
            })
            if (!professor) {
                return res.status(404).json({ message: 'SIAPE não encontrado.' })
            }
            return res.status(200).json(professor)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * POST /painel/assumir
     * Body: { siape, diario_id }
     * Atribui o diário ao professor identificado pelo SIAPE.
     */
    assumir = async (req, res) => {
        try {
            const { siape, diario_id } = req.body

            const professor = await Professor.findOne({ where: { siape, status: 1 } })
            if (!professor) {
                return res.status(404).json({ message: 'SIAPE não encontrado.' })
            }

            const diario = await Diario.findByPk(diario_id)
            if (!diario) {
                return res.status(404).json({ message: 'Diário não encontrado.' })
            }

            await diario.update({ professor_id: professor.id })

            return res.status(200).json({
                message:   'Diário assumido com sucesso!',
                professor: professor.toJSON(),
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * POST /painel/liberar
     * Body: { siape, diario_id }
     * Remove a atribuição do professor no diário (somente o próprio professor pode liberar).
     */
    liberar = async (req, res) => {
        try {
            const { siape, diario_id } = req.body

            const professor = await Professor.findOne({ where: { siape, status: 1 } })
            if (!professor) {
                return res.status(404).json({ message: 'SIAPE não encontrado.' })
            }

            const diario = await Diario.findByPk(diario_id)
            if (!diario) {
                return res.status(404).json({ message: 'Diário não encontrado.' })
            }

            if (diario.professor_id !== professor.id) {
                return res.status(403).json({ message: 'Você só pode liberar diários que são seus.' })
            }

            await diario.update({ professor_id: null })

            return res.status(200).json({ message: 'Diário liberado com sucesso!' })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new PainelController()
