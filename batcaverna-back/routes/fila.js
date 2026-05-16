import express from 'express'
const router = express.Router()
import fila from '../controllers/FilaController.js'

router.get('/', fila.listar)

export default router
