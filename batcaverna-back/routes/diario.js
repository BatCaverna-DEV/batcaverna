import express from 'express'
const router = express.Router()
import diario from '../controllers/DiarioController.js'
import auth from '../helpers/auth.js'

router.get('/:id', auth, diario.index)
router.post('/cadastro', auth, diario.cadastrar)
export default router