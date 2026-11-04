import express from 'express'
const router = express.Router()

import plano          from '../controllers/PlanoController.js'
import auth           from '../helpers/auth.js'
import { ehGestor }   from '../helpers/role.js'

// O escopo (curso do coordenador) vem do token, não da URL.
router.get('/',     auth, ehGestor, plano.index)      // Supremo + Coordenador
router.put('/:id',  auth, ehGestor, plano.atualizar)  // Supremo + Coordenador

export default router
