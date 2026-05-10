import express from 'express'
const router = express.Router()

import curso          from '../controllers/CursoController.js'
import auth           from '../helpers/auth.js'
import { ehSupremo }  from '../helpers/role.js'

router.get('/',             auth,            curso.index)      // Supremo + Coordenador
router.get('/coordena/:id', auth,            curso.getCurso)   // Supremo + Coordenador
router.post('/cadastro',    auth, ehSupremo, curso.cadastrar)  // apenas Supremo

export default router