import Curso from '../models/Curso.js'
import Professor from '../models/Professor.js'

class CursoController {

    index = async (req, res) => {
        const cursos = await Curso.findAll({
            where: {
                status: 1
            },
            include:{
                model: Professor,
                as: 'professor'
            }
        })
        return res.status(200).json(cursos)
    }

    cadastrar = async (req, res) => {
        const curso = req.body
        curso.status = 1

        Curso.create(curso).then(curso => {
            res.status(201).json(curso)
        }).catch(err => {
            res.status(500).json(err)
        })
    }

    getCurso = async (req, res) => {
        let id = req.params.id
        const curso = await Curso.findOne({
            where: {
                professor_id: id
            }
        })
        return res.status(200).json(curso)
    }

}

export default new CursoController()