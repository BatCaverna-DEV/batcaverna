import express from 'express'
const router = express.Router()
import painel from '../controllers/PainelController.js'

router.get('/demanda',           painel.demanda)
router.get('/professor/:siape',  painel.identificar)
router.post('/assumir',          painel.assumir)
router.post('/liberar',          painel.liberar)

export default router
