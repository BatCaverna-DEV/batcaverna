import express from 'express'
const router = express.Router()
import turma from '../controllers/TurmaController.js'
import auth from '../helpers/auth.js'

router.get('/:id', auth, turma.index)
router.post('/cadastro', auth, turma.cadastrar)

export default router