import Diario from '../models/Diario.js'
import Professor from '../models/Professor.js'
import Turma from '../models/Turma.js'
import Curso from '../models/Curso.js'

class DiarioController {

    index = async (req, res) => {
        const id = req.params.id
        const supremo = req.userCategoria === 1

        const cursoInclude = {
            model: Curso,
            as: 'curso',
            ...(supremo ? {} : { where: { professor_id: id } }),
        }

        const turmaInclude = {
            model: Turma,
            as: 'turma',
            required: true,
            include: cursoInclude,
        }

        const diarios = await Diario.findAll({
            where: { status: 1 },
            include: [
                { model: Professor, as: 'professor' },
                turmaInclude,
            ]
        })

        return res.status(200).json(diarios)

    }//Fim do index

    cadastrar = async (req, res) => {
        const { descricao, carga, turma_id } = req.body

        try {
            const turma = await Turma.findByPk(turma_id, {
                include: { model: Curso, as: 'curso' }
            })
            if (!turma) {
                return res.status(404).json({ message: 'Turma não encontrada.' })
            }

            const categoria = turma.curso.categoria
            const hsPorAula = categoria === 1 ? 40 : 20
            const aulas_semana = Math.round(carga / hsPorAula)

            const diario = await Diario.create({
                descricao,
                carga,
                turma_id,
                aulas_semana,
                status:     1,
                ministrada: 0,
                codigo: categoria,
            })
            return res.status(201).json(diario)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

    atualizar = async (req, res) => {
        const { descricao, carga, turma_id, professor_id, ministrada, horario, aulas_semana } = req.body

        try {
            const diario = await Diario.findByPk(req.params.id)
            if (!diario) {
                return res.status(404).json({ message: 'Diário não encontrado.' })
            }

            const turma = await Turma.findByPk(turma_id ?? diario.turma_id, {
                include: { model: Curso, as: 'curso' }
            })

            const categoria        = turma?.curso?.categoria ?? diario.codigo
            const hsPorAula        = categoria === 1 ? 40 : 20
            const novaCarga        = carga ?? diario.carga
            const aulas_semana_calc = Math.round(novaCarga / hsPorAula)

            await diario.update({
                descricao:    descricao    ?? diario.descricao,
                carga:        novaCarga,
                turma_id:     turma_id     ?? diario.turma_id,
                professor_id: professor_id !== undefined ? (professor_id || null) : diario.professor_id,
                ministrada:   ministrada   ?? diario.ministrada,
                horario:      horario      !== undefined ? (horario || null) : diario.horario,
                aulas_semana: aulas_semana ?? aulas_semana_calc,
                codigo: categoria,
            })

            return res.status(200).json(diario)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

    deletar = async (req, res) => {
        try {
            const diario = await Diario.findByPk(req.params.id, {
                include: {
                    model: Turma,
                    as: 'turma',
                    include: { model: Curso, as: 'curso' },
                }
            })
            if (!diario) {
                return res.status(404).json({ message: 'Diário não encontrado.' })
            }

            if (req.userCategoria === 2) {
                if (diario.turma?.curso?.professor_id !== req.userProfessorId) {
                    return res.status(403).json({ message: 'Acesso restrito aos diários do seu curso.' })
                }
            }

            await diario.destroy()
            return res.status(200).json({ message: 'Diário excluído com sucesso.' })
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

}//Fim da Classe

export default new DiarioController();