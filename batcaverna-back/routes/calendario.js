import express from 'express'
const router = express.Router()
import calendario from '../controllers/CalendarioController.js'
import auth from '../helpers/auth.js'

router.get('/', auth, calendario.index);
router.post('/cadastro', auth, calendario.cadastrar)
router.post('/gerar', calendario.testar)
router.get('/semana/:data', calendario.semana)

export default router
