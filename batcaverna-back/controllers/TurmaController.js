import Turma from '../models/Turma.js'
import Professor from '../models/Professor.js'
import Calendario from '../models/Calendario.js'
import Curso from '../models/Curso.js'

class TurmaController {

    index = async (req, res) => {
        let id = req.params.id //ido do coordenador
        const turmas = await Turma.findAll({
            where:{
                status: 1
            },
            include: [
                {
                    model: Calendario,
                    as: 'calendario'
                },
                {
                    model: Curso,
                    as: 'curso',
                    include:{
                        model: Professor,
                        as: 'professor'
                    },
                    where:{
                        professor_id: id
                    }
                }
            ]
        })
        return res.status(200).json(turmas)
    }//Fim do Index

    cadastrar = async (req, res) => {

        const turma = req.body
        turma.status = 1
        Turma.create(turma).then((turma)=>{
            res.status(201).json(turma)
        }).catch((err)=>{
            res.status(500).json(err)
        })

    }

}

export default new TurmaController()