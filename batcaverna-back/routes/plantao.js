import express from 'express'
const router = express.Router()

import auth          from '../helpers/auth.js'
import { ehSupremo } from '../helpers/role.js'
import plantao       from '../controllers/PlantaoController.js'

router.get('/tipos',                      auth,            plantao.indexTipos)
router.get('/semestres',                  auth,            plantao.indexSemestres)
router.post('/semestres',                 auth, ehSupremo, plantao.criarSemestre)
router.get('/fila/:semestre_id',          auth,            plantao.filaDoSemestre)
router.get('/fila-geral',                 auth,            plantao.indexFilaGeral)
router.post('/escala',                    auth, ehSupremo, plantao.adicionarEscala)
router.put('/escala/:id',                 auth, ehSupremo, plantao.atualizarEscala)
router.delete('/escala/:id',              auth, ehSupremo, plantao.removerEscala)

export default router
