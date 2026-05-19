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

    atualizar = async (req, res) => {
        const { codigo, descricao, curso_id, calendario_id } = req.body
        try {
            const turma = await Turma.findByPk(req.params.id)
            if (!turma) {
                return res.status(404).json({ message: 'Turma não encontrada.' })
            }
            await turma.update({
                codigo:        codigo        ?? turma.codigo,
                descricao:     descricao     ?? turma.descricao,
                curso_id:      curso_id      ?? turma.curso_id,
                calendario_id: calendario_id ?? turma.calendario_id,
            })
            return res.status(200).json(turma)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

}

export default new TurmaController()