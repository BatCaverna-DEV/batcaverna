import Calendario from '../models/Calendario.js'
import Curso      from '../models/Curso.js'
import Diario     from '../models/Diario.js'
import Professor  from '../models/Professor.js'
import Turma      from '../models/Turma.js'

/**
 * Rotas de leitura para outros sistemas (/integracao/v1). Ver INTEGRACAO.md.
 *
 * Os campos saem em camelCase, e os textos como estão no banco.
 * Registros inativos também saem, com o status, para o consumidor
 * distinguir "desativado" de "inexistente".
 */

const paraCalendario = (c) => ({
    id:           c.id,
    descricao:    c.descricao,
    ano:          c.ano,
    semestre:     c.semestre,
    inicio:       c.inicio,
    fim:          c.fim,
    status:       c.status,
    atualizadoEm: c.updatedAt,
})

const CAMPOS_CALENDARIO = ['id', 'descricao', 'ano', 'semestre', 'inicio', 'fim', 'status', 'updatedAt']

class IntegracaoController {

    /** GET /integracao/v1/calendarios — todos, do mais recente para o mais antigo. */
    calendarios = async (req, res) => {
        try {
            const calendarios = await Calendario.findAll({
                attributes: CAMPOS_CALENDARIO,
                order: [['inicio', 'DESC'], ['descricao', 'DESC']],
                raw: true,
            })
            return res.status(200).json(calendarios.map(paraCalendario))
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * GET /integracao/v1/calendarios/:id/oferta
     * Cursos, turmas e diários do calendário numa resposta só.
     */
    oferta = async (req, res) => {
        try {
            const calendario = await Calendario.findOne({
                where: { id: req.params.id },
                attributes: CAMPOS_CALENDARIO,
                raw: true,
            })
            if (!calendario) {
                return res.status(404).json({ message: 'Calendário não encontrado.' })
            }

            const turmas = await Turma.findAll({
                where: { calendario_id: calendario.id },
                attributes: ['id', 'codigo', 'descricao', 'status', 'curso_id', 'updatedAt'],
                order: [['codigo', 'ASC'], ['descricao', 'ASC']],
                raw: true,
            })
            const idsTurmas = turmas.map(t => t.id)
            const idsCursos = [...new Set(turmas.map(t => t.curso_id).filter(Boolean))]

            const cursos = idsCursos.length
                ? await Curso.findAll({
                    where: { id: idsCursos },
                    attributes: ['id', 'descricao', 'categoria', 'status', 'updatedAt'],
                    order: [['descricao', 'ASC']],
                    raw: true,
                })
                : []

            const diarios = idsTurmas.length
                ? await Diario.findAll({
                    where: { turma_id: idsTurmas },
                    attributes: ['id', 'descricao', 'carga', 'aulas_semana', 'status', 'turma_id', 'professor_id', 'updatedAt'],
                    raw: true,
                })
                : []

            const idsProfessores = [...new Set(diarios.map(d => d.professor_id).filter(Boolean))]
            const professores = idsProfessores.length
                ? await Professor.findAll({
                    where: { id: idsProfessores },
                    attributes: ['id', 'siape', 'nome'],
                    raw: true,
                })
                : []
            const professorPorId = new Map(professores.map(p => [p.id, p]))

            // Diários na ordem das turmas e, dentro de cada turma, pela descrição.
            const ordemTurma = new Map(idsTurmas.map((id, i) => [id, i]))
            diarios.sort((a, b) =>
                (ordemTurma.get(a.turma_id) - ordemTurma.get(b.turma_id)) ||
                a.descricao.localeCompare(b.descricao, 'pt-BR'))

            return res.status(200).json({
                geradoEm:   new Date().toISOString(),
                calendario: paraCalendario(calendario),
                cursos: cursos.map(c => ({
                    id:           c.id,
                    descricao:    c.descricao,
                    categoria:    c.categoria,
                    status:       c.status,
                    atualizadoEm: c.updatedAt,
                })),
                turmas: turmas.map(t => ({
                    id:           t.id,
                    codigo:       t.codigo,
                    descricao:    t.descricao,
                    status:       t.status,
                    cursoId:      t.curso_id,
                    atualizadoEm: t.updatedAt,
                })),
                diarios: diarios.map(d => {
                    const p = professorPorId.get(d.professor_id)
                    return {
                        id:           d.id,
                        descricao:    d.descricao,
                        carga:        d.carga,
                        aulasSemana:  d.aulas_semana,
                        status:       d.status,
                        turmaId:      d.turma_id,
                        professor:    p ? { id: p.id, siape: p.siape, nome: p.nome } : null,
                        atualizadoEm: d.updatedAt,
                    }
                }),
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /** GET /integracao/v1/professores — todos, de qualquer status, por nome. */
    professores = async (req, res) => {
        try {
            const professores = await Professor.findAll({
                attributes: ['id', 'nome', 'siape', 'email', 'status', 'tipo', 'updatedAt'],
                order: [['nome', 'ASC']],
                raw: true,
            })
            return res.status(200).json(professores.map(p => ({
                id:           p.id,
                nome:         p.nome,
                siape:        p.siape,
                email:        p.email,
                status:       p.status,
                tipo:         p.tipo,
                atualizadoEm: p.updatedAt,
            })))
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
}

export default new IntegracaoController()
