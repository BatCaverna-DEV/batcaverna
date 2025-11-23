import Professor from '../models/Professor.js'
import Usuario from '../models/Usuario.js'
import { Op } from 'sequelize'

class ProfessorController {

    index = async (req, res)=>{
        const professores = await Professor.findAll({
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'username', 'categoria', 'status'] // não traga o password
            }]
        })
        return res.status(200).json(professores)
    }

    cadastrar = async (req, res)=>{
        console.log('Iniciou o cadastro...')
        const professor = req.body

        const p = await Professor.findOne({
            where: {
                [Op.or]: [
                    { siape: professor.siape },
                    { email: professor.email }
                ]
            }
        })

        if(p){
            return await res.status(501).json({message:"SIAPE e/ou E-mail já cadastrados!"});
        }
        console.log('Verificou todos os erros!')
        professor.status = 1
        Professor.create(professor).then(async (professor)=>{
            const usuario = {
                username: professor.siape,
                email: professor.email,
                categoria: 1,
                status: 1,
                professor_id: professor.id
            }
            const u = await Usuario.create(usuario)
            return res.status(200).json(professor)
        }).catch((err)=>{
            console.log('ERRO: '+err.message);
            return res.status(500).json({message: err.message})
        })

    }//Fim do Cadastro

}//Fim da Classe

export default new ProfessorController()