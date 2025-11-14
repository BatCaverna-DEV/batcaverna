import express from 'express'
const router = express.Router()

import auth from '../helpers/auth.js'
import professor from '../controllers/ProfessorController.js';

router.get('/', auth, professor.index);
router.post('/cadastro', auth, professor.cadastrar)

export default router