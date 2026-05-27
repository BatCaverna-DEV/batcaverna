import express from 'express'
const router = express.Router()

import diario              from '../controllers/DiarioController.js'
import importar, { upload } from '../controllers/ImportarController.js'
import auth                from '../helpers/auth.js'
import { ehSupremo, ehGestor } from '../helpers/role.js'
router.get('/:id',        auth, diario.index)
router.post('/cadastro',  auth, diario.cadastrar)
router.put('/:id',        auth, diario.atualizar)
router.delete('/:id',     auth, ehGestor,  diario.deletar)

router.post('/importar',  auth, ehGestor, upload.single('arquivo'), importar.importar)



export default router