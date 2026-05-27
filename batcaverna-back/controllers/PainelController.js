import banco      from '../config/banco.js'
import Diario     from '../models/Diario.js'
import Professor  from '../models/Professor.js'
import Turma      from '../models/Turma.js'
import Curso      from '../models/Curso.js'
import Calendario from '../models/Calendario.js'

class PainelController {

    /**
     * GET /painel/cursos
     * Lista os cursos ativos com coordenador e contagens de turmas e diários.
     * Rota pública — sem autenticação.
     */
    cursos = async (req, res) => {
        try {
            const cursos = await Curso.findAll({
                where: { status: 1 },
                include: [{ model: Professor, as: 'professor' }],
                order: [['descricao', 'ASC']],
            })

            // Contagem de turmas por curso
            const contagemTurmas = await Turma.findAll({
                attributes: [
                    'curso_id',
                    [banco.Sequelize.fn('COUNT', banco.Sequelize.col('id')), 'total'],
                ],
                where:  { status: 1 },
                group:  ['curso_id'],
                raw:    true,
            })

            // Contagem de diários por curso (via JOIN com turma)
            const contagemDiarios = await Diario.findAll({
                attributes: [
                    [banco.Sequelize.col('turma.curso_id'), 'curso_id'],
                    [banco.Sequelize.fn('COUNT', banco.Sequelize.col('diarios.id')), 'total'],
                ],
                where: { status: 1 },
                include: [{ model: Turma, as: 'turma', attributes: [] }],
                group: [banco.Sequelize.col('turma.curso_id')],
                raw:   true,
            })

            const mapTurmas  = Object.fromEntries(contagemTurmas.map(r  => [r.curso_id, Number(r.total)]))
            const mapDiarios = Object.fromEntries(contagemDiarios.map(r => [r.curso_id, Number(r.total)]))

            const resultado = cursos.map(c => ({
                ...c.toJSON(),
                qtdTurmas:  mapTurmas[c.id]  ?? 0,
                qtdDiarios: mapDiarios[c.id] ?? 0,
            }))

            return res.status(200).json(resultado)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * GET /painel/demanda?curso_id=:id
     * Retorna as turmas (com diários e professores) de um curso específico.
     * Rota pública — sem autenticação.
     */
    demanda = async (req, res) => {
        try {
            const { curso_id } = req.query

            const includeTurma = {
                model: Turma,
                as: 'turma',
                include: [
                    { model: Curso,      as: 'curso' },
                    { model: Calendario, as: 'calendario' },
                ],
            }

            // Filtra pela turma do curso quando informado
            if (curso_id) includeTurma.where = { curso_id }

            const diarios = await Diario.findAll({
                where: { status: 1 },
                include: [
                    { model: Professor, as: 'professor', required: false },
                    includeTurma,
                ],
                order: [['descricao', 'ASC']],
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
     * GET /painel/meus-diarios/:siape
     * Retorna todos os diários assumidos pelo professor em qualquer curso/turma.
     * Rota pública — sem autenticação.
     */
    meusDiarios = async (req, res) => {
        try {
            const professor = await Professor.findOne({
                where: { siape: req.params.siape, status: 1 },
            })
            if (!professor) {
                return res.status(404).json({ message: 'SIAPE não encontrado.' })
            }

            const diarios = await Diario.findAll({
                where: { professor_id: professor.id, status: 1 },
                include: [{
                    model: Turma,
                    as: 'turma',
                    include: [{ model: Curso, as: 'curso' }],
                }],
                order: [
                    [{ model: Turma, as: 'turma' }, 'codigo', 'ASC'],
                    ['descricao', 'ASC'],
                ],
            })

            return res.status(200).json(diarios)
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
