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
        const diario = req.body

        diario.status = 1
        diario.ministrada = 0

        Diario.create(diario).then((diario) => {
            res.status(201).json(diario)
        }).catch((err) => {
            res.status(500).json(err)
        })
    }

}//Fim da Classe

export default new DiarioController();