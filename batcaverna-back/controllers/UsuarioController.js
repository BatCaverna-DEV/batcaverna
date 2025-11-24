import Usuario from '../models/Usuario.js'
import Professor from '../models/Professor.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const secret = process.env.JWT_SECRET

class UsuarioController{

    login = async (req, res) => {

        try{
            let username = req.body.username
            let password = req.body.password
            const user = await Usuario.findOne({
                where:{
                    username: username
                },
                include:{
                    model: Professor,
                    as: 'professor'
                }
            })
            //console.log(user)

            if (!user) {
                return res.status(401).json({'message': 'Usuário não encontrado!'})
            }

            if(user.categoria != 2){
                return res.status(401).json({message: 'Acesso para professor ainda não permitido!'})
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                return res.status(401).json({'message': 'Senha Incorreta!'})
            }

            const token = jwt.sign({id: user.id, professor_id: user.professor.id, username: user.username, nome: user.professor.nome, email: user.professor.email}, secret, {expiresIn: '1h'} )

            return res.status(200).json({'value': token})
        }catch(err){
            return res.status(500).json({'message': err})
        }

    }//Fim do Login

    gerar = async (req, res) => {

        const salt = await bcrypt.genSalt(10)
        const senha = req.params.senha
        const password = await bcrypt.hash(senha, salt)
        res.status(200).send({'senha': password})

    }

}//Fim da Classe

export default new UsuarioController();