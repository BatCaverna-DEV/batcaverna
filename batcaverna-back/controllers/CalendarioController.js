import Calendario from '../models/Calendario.js';

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

    semana = async (req, res) => {
        const data = new Date(req.params.data)

        const diaSemana = data.getDay(); // 0 = domingo ... 6 = sábado

        // Ajuste para semana começando na segunda-feira
        const diffParaSegunda = (diaSemana + 6) % 7;

        // Encontrar a segunda-feira da semana da data fornecida
        const segunda = new Date(data);
        segunda.setDate(data.getDate() - diffParaSegunda);

        const nomesDias = [
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado"
        ];

        const semana = [];

        // Loop só até sábado (6 dias)
        for (let i = 0; i < 6; i++) {
            const d = new Date(segunda);
            d.setDate(segunda.getDate() + i);

            const dia = String(d.getDate()).padStart(2, "0");
            const mes = String(d.getMonth() + 1).padStart(2, "0");
            const ano = d.getFullYear();

            semana.push({
                dataCompleta: d,
                dataFormatada: `${dia}/${mes}/${ano}`,
                diaSemana: nomesDias[i]
            });
        }

        res.status(200).json(semana)

    }//Fim semana

}

export default new CalendarioController()