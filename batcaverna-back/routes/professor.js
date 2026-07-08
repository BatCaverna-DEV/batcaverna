import express from 'express'
const router = express.Router()

import auth                    from '../helpers/auth.js'
import { ehSupremo, ehGestor } from '../helpers/role.js'
import professor               from '../controllers/ProfessorController.js'

router.get('/',              auth,           professor.index)          // Supremo + Coordenador
router.get('/carga',         auth,           professor.cargaHoraria)   // Supremo + Coordenador
router.post('/cadastro',     auth, ehGestor,  professor.cadastrar)     // Supremo + Coordenador
router.put('/:id',           auth, ehGestor,  professor.atualizar)     // Supremo + Coordenador
router.put('/:id/status',    auth, ehGestor,  professor.alterarStatus) // Supremo + Coordenador
router.put('/:id/promover',  auth, ehSupremo, professor.promover)      // apenas Supremo

export default router