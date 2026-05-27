import express from 'express'
const router = express.Router()

import turma          from '../controllers/TurmaController.js'
import auth           from '../helpers/auth.js'
import { ehGestor }  from '../helpers/role.js'

router.get('/:id',       auth,           turma.index)
router.post('/cadastro', auth, ehGestor, turma.cadastrar)
router.put('/:id',       auth, ehGestor, turma.atualizar)
router.delete('/:id',    auth, ehGestor, turma.deletar)

export default router