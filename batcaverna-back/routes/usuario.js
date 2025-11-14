import express from 'express'
const router = express.Router()

import usuario from '../controllers/UsuarioController.js'

router.post('/login', usuario.login)
router.get('/gerar/:senha', usuario.gerar)

export default router