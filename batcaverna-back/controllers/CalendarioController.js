import Calendario from '../models/Calendario.js'

class CalendarioController {

    index = async (req, res)=>{
        const calendarios = await Calendario.findAll({
            order: [['status', 'DESC']],
        })
        res.status(200).json(calendarios)
    }

    cadastrar = async (req, res) => {

        const calendario = req.body
        console.log(calendario)

        calendario.status = 1
        Calendario.create(calendario).then(calendario => {
            return res.status(201).json(calendario)
        }).catch(err => {
            return res.status(500).json({'message': err})
        })

    }//Fim do Cadastrar



}

export default new CalendarioController()