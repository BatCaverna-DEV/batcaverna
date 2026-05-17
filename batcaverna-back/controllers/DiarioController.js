import Diario from '../models/Diario.js'
import Professor from '../models/Professor.js'
import Turma from '../models/Turma.js'
import Curso from '../models/Curso.js'

class DiarioController {

    index = async (req, res) => {
        let id = req.params.id
        const diarios = await Diario.findAll({
            where: {
                status: 1
            },
            include: [
                {
                    model: Professor,
                    as: 'professor',
                },
                {
                    model: Turma,
                    as: 'turma',
                    include: {
                        model: Curso,
                        as: 'curso',
                        where: {
                            professor_id: id
                        }
                    }
                }
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
            })
            return res.status(201).json(diario)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

}//Fim da Classe

export default new DiarioController();