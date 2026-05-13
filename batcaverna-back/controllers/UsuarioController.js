import Usuario    from '../models/Usuario.js'
import Professor  from '../models/Professor.js'
import bcrypt     from 'bcrypt'
import jwt        from 'jsonwebtoken'
import dotenv     from 'dotenv'
import mailer     from '../config/mailer.js'
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

            if (user.categoria < 1) {
                return res.status(401).json({ message: 'Usuário sem acesso ao sistema.' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                return res.status(401).json({'message': 'Senha Incorreta!'})
            }

            const token = jwt.sign({
                id:          user.id,
                professor_id: user.professor.id,
                username:    user.username,
                nome:        user.professor.nome,
                email:       user.professor.email,
                categoria:   user.categoria,
            }, secret, { expiresIn: '1h' })

            return res.status(200).json({'value': token})
        }catch(err){
            return res.status(500).json({'message': err})
        }

    }//Fim do Login

    /**
     * PUT /usuario/senha
     * Body: { senhaAtual, novaSenha }
     * Altera a senha do usuário autenticado (req.userId vem do middleware auth).
     */
    alterarSenha = async (req, res) => {
        try {
            const { senhaAtual, novaSenha } = req.body

            if (!senhaAtual || !novaSenha) {
                return res.status(400).json({ message: 'Preencha todos os campos.' })
            }
            if (novaSenha.length < 6) {
                return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' })
            }

            const user = await Usuario.findByPk(req.userId)
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' })
            }

            const senhaCorreta = await bcrypt.compare(senhaAtual, user.password)
            if (!senhaCorreta) {
                return res.status(401).json({ message: 'Senha atual incorreta.' })
            }

            const hash = await bcrypt.hash(novaSenha, 10)
            await user.update({ password: hash })

            return res.status(200).json({ message: 'Senha alterada com sucesso!' })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * POST /usuario/recuperar
     * Body: { siape }
     * Gera um código de 6 dígitos, salva no campo `codigo` e envia por e-mail.
     */
    recuperarSenha = async (req, res) => {
        try {
            const { siape } = req.body
            if (!siape) return res.status(400).json({ message: 'Informe o SIAPE.' })

            const user = await Usuario.findOne({
                where: { username: siape },
                include: { model: Professor, as: 'professor' },
            })

            // Resposta genérica para não revelar se o SIAPE existe ou não
            if (!user || !user.professor) {
                return res.status(200).json({ message: 'Se o SIAPE estiver cadastrado, você receberá um e-mail.' })
            }

            // Código de 6 dígitos
            const codigo = String(Math.floor(100000 + Math.random() * 900000))
            await user.update({ codigo })

            const link = `${process.env.APP_URL}/usuario/redefinir?id=${user.id}&codigo=${codigo}`

            await mailer.sendMail({
                from:    process.env.MAIL_FROM,
                to:      user.professor.email,
                subject: 'Batcaverna — Redefinição de Senha',
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
                        <div style="background:#212529;padding:20px 24px;border-radius:8px 8px 0 0">
                            <h2 style="color:#fff;margin:0;font-size:1.1rem;letter-spacing:.05em">🦇 BATCAVERNA</h2>
                        </div>
                        <div style="border:1px solid #dee2e6;border-top:none;border-radius:0 0 8px 8px;padding:28px 24px">
                            <p style="margin:0 0 8px">Olá, <strong>${user.professor.nome.split(' ')[0]}</strong>!</p>
                            <p style="color:#495057">Recebemos uma solicitação de redefinição de senha para o seu acesso ao sistema Batcaverna.</p>
                            <p style="color:#495057">Clique no botão abaixo para criar uma nova senha:</p>
                            <div style="text-align:center;margin:28px 0">
                                <a href="${link}"
                                   style="background:#212529;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:.95rem">
                                   Redefinir minha senha
                                </a>
                            </div>
                            <p style="color:#6c757d;font-size:.82rem">
                                Se você não solicitou a redefinição, ignore este e-mail — sua senha permanece a mesma.<br>
                                Este link é de uso único.
                            </p>
                            <hr style="border:none;border-top:1px solid #dee2e6;margin:20px 0">
                            <p style="color:#adb5bd;font-size:.78rem;margin:0">
                                SIAPE: ${siape} &nbsp;|&nbsp; IFCE — Sistema Batcaverna
                            </p>
                        </div>
                    </div>
                `,
            })

            return res.status(200).json({ message: 'Se o SIAPE estiver cadastrado, você receberá um e-mail.' })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * POST /usuario/redefinir
     * Body: { id, codigo, novaSenha }
     * Valida o código e redefine a senha.
     */
    redefinirSenha = async (req, res) => {
        try {
            const { id, codigo, novaSenha } = req.body

            if (!id || !codigo || !novaSenha) {
                return res.status(400).json({ message: 'Dados incompletos.' })
            }
            if (novaSenha.length < 6) {
                return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' })
            }

            const user = await Usuario.findByPk(id)
            console.log(user);
            if (!user || !user.codigo) {
                return res.status(400).json({ message: 'Link inválido ou expirado.' })
            }
            if (user.codigo !== codigo) {
                return res.status(400).json({ message: 'Código incorreto.' })
            }

            const hash = await bcrypt.hash(novaSenha, 10)
            await user.update({ password: hash, codigo: null })

            return res.status(200).json({ message: 'Senha redefinida com sucesso!' })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    gerar = async (req, res) => {
        const salt = await bcrypt.genSalt(10)
        const senha = req.params.senha
        const password = await bcrypt.hash(senha, salt)
        res.status(200).send({'senha': password})
    }

}//Fim da Classe

export default new UsuarioController();