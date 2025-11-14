import Professor from '../models/Professor.js'
import Usuario from '../models/Usuario.js'
import Calendario from '../models/Calendario.js'
import Curso from '../models/Curso.js'
import Turma from '../models/Turma.js'
import Diario from '../models/Diario.js'

await Professor.sync()
await Usuario.sync()
await Calendario.sync()
await Curso.sync()
await Turma.sync()
await Diario.sync()