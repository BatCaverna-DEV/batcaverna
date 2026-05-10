import express from 'express'
const router = express.Router()

import usuario from '../controllers/UsuarioController.js'
import auth    from '../helpers/auth.js'

router.post('/login',   usuario.login)
router.put('/senha',    auth, usuario.alterarSenha)
router.get('/gerar/:senha', usuario.gerar)

export default router