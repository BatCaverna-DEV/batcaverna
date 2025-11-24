import express from 'express'
const router = express.Router()
import diario from '../controllers/DiarioController.js'
import auth from '../helpers/auth.js'
import {interpretarHorarios} from "../helpers/data.js";

router.get('/:id', auth, diario.index)
router.post('/cadastro', auth, diario.cadastrar)

router.post('/horario', (req, res) => {
    const horario = req.body.h
    const horarios = interpretarHorarios(horario)
    res.status(200).json(horarios)

})



export default router