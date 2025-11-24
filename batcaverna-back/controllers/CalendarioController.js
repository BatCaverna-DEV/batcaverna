import Calendario from '../models/Calendario.js'
import Dia from '../models/Dia.js'
import {gerarDias} from "../helpers/data.js";

class CalendarioController {

    index = async (req, res)=>{
        const calendarios = await Calendario.findAll({
            order: [['status', 'DESC']],
        })
        res.status(200).json(calendarios)
    }

    cadastrar = async (req, res) => {

        const dados = req.body
        dados.status = 1

        try{
            const calendario = await Calendario.create(dados)
            calendario.dias = []
            const dias = gerarDias(calendario.inicio, calendario.fim)
            for await (const dia of dias){
                dia.calendario_id = calendario.id
                const d = await Dia.create(dia)
                calendario.dias.push(d)
            }
            return res.status(200).json(calendario)
        }catch(err){
            res.status(500).json({message: err.message})
        }


        // Calendario.create(calendario).then(calendario => {
        //     return res.status(201).json(calendario)
        // }).catch(err => {
        //     return res.status(500).json({'message': err})
        // })

    }//Fim do Cadastrar

    testar  = async (req, res) => {
        const inicio = req.body.inicio
        const fim = req.body.fim

        const dias = gerarDias(inicio, fim)


        return res.status(200).json(dias)

    }


}

export default new CalendarioController()