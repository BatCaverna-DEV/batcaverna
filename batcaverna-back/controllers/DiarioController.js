import Diario from '../models/Diario.js'
import Dia from '../models/Dia.js'
import Professor from '../models/Professor.js'
import Turma from '../models/Turma.js'
import Curso from '../models/Curso.js'
import Horario from '../models/Horario.js'
import {interpretarHorarios} from "../helpers/data.js";

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
        const dados = req.body

        dados.status = 1
        dados.ministrada = 0

        try{
            const diario = await Diario.create(dados)
            const horarios = interpretarHorarios(diario.horario)
            for(let horario of horarios){
                //Pega os dias
                let dias = await Dia.findAll({
                    where: {
                        dia: horario.dia
                    }
                })

                //Cria os horários para aquele dia
                for(let dia of dias){
                    if(dia.dia === horario.dia){
                        let h = {
                            ordem: horario.horario,
                            turno: horario.turno,
                            status: 0,
                            dia_id: dia.id,
                            diario_id: diario.id
                        }
                        await Horario.create(h)
                    }
                }

            }
            return res.status(200).json(diario)
        }catch(err){
            res.status(400).json({error: err.message})
        }

        // Diario.create(diario).then((diario) => {
        //     res.status(201).json(diario)
        // }).catch((err) => {
        //     res.status(500).json(err)
        // })
    }

}//Fim da Classe

export default new DiarioController();