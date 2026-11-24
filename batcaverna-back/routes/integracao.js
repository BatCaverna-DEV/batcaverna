import express from 'express'
const router = express.Router()

import integracao from '../controllers/IntegracaoController.js'
import token      from '../helpers/integracao.js'

// Leitura para outros sistemas (GradeIF). Token de serviço; ver INTEGRACAO.md.
router.use(token)

router.get('/v1/calendarios',             integracao.calendarios)
router.get('/v1/calendarios/:id/oferta',  integracao.oferta)
router.get('/v1/professores',             integracao.professores)

export default router
