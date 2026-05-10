import express from 'express'
const router = express.Router()

import calendario    from '../controllers/CalendarioController.js'
import auth          from '../helpers/auth.js'
import { ehSupremo } from '../helpers/role.js'

router.get('/',          auth,            calendario.index)      // Supremo + Coordenador
router.post('/cadastro', auth, ehSupremo, calendario.cadastrar)  // apenas Supremo
router.post('/gerar',    calendario.testar)
router.get('/semana/:data', calendario.semana)

export default router
