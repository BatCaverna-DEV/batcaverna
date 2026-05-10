import express from 'express'
const router = express.Router()

import turma          from '../controllers/TurmaController.js'
import auth           from '../helpers/auth.js'
import { ehSupremo }  from '../helpers/role.js'

router.get('/:id',       auth,            turma.index)      // Supremo + Coordenador
router.post('/cadastro', auth, ehSupremo, turma.cadastrar)  // apenas Supremo

export default router