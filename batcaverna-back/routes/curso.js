import express from 'express'
const router = express.Router()
import curso from '../controllers/CursoController.js'
import auth from '../helpers/auth.js'

router.get('/', auth, curso.index);
router.post('/cadastro', auth, curso.cadastrar)
router.get('/coordena/:id', auth, curso.getCurso);

export default router