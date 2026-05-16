import express from 'express'
const router = express.Router()

import turma          from '../controllers/TurmaController.js'
import auth           from '../helpers/auth.js'
import { ehGestor }  from '../helpers/role.js'

router.get('/:id',       auth,           turma.index)      // Supremo + Coordenador
router.post('/cadastro', auth, ehGestor, turma.cadastrar)  // Supremo + Coordenador

export default router