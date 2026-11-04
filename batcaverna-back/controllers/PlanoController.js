import Diario from '../models/Diario.js'
import Professor from '../models/Professor.js'
import Turma from '../models/Turma.js'
import Curso from '../models/Curso.js'

/**
 * Etapas do plano de ensino (campo `plano` do model Diario).
 *
 *   1 -> Pendente
 *   2 -> Entregue ao Pedagógico
 *   3 -> Revisado pelo Pedagógico
 *   4 -> Entregue ao Conselho
 *   5 -> Aprovado pelo Conselho
 *   6 -> Inserido no Diário
 */
export const PLANO_ETAPAS = {
    1: 'Pendente',
    2: 'Entregue ao Pedagógico',
    3: 'Revisado pelo Pedagógico',
    4: 'Entregue ao Conselho',
    5: 'Aprovado pelo Conselho',
    6: 'Inserido no Diário',
}

export const PLANO_MIN = 1
export const PLANO_MAX = 6

/** Diários antigos podem ter `plano` nulo — tratados como Pendente. */
const normalizar = (valor) => Number(valor) || PLANO_MIN

class PlanoController {

    /**
     * GET /plano
     * Lista os diários ativos com o status do plano de ensino.
     *
     * O escopo vem do TOKEN (`req.userProfessorId`), nunca da URL:
     *   - Supremo (categoria 1) enxerga todos os cursos;
     *   - Coordenador (categoria 2) enxerga apenas o curso que coordena.
     */
    index = async (req, res) => {
        try {
            const supremo = req.userCategoria === 1

            const cursoInclude = {
                model: Curso,
                as: 'curso',
                include: [{ model: Professor, as: 'professor', attributes: ['id', 'nome'] }],
                ...(supremo ? {} : { where: { professor_id: req.userProfessorId } }),
            }

            const diarios = await Diario.findAll({
                where: { status: 1 },
                include: [
                    { model: Professor, as: 'professor', attributes: ['id', 'nome', 'siape'], required: false },
                    {
                        model: Turma,
                        as: 'turma',
                        required: true,
                        include: [cursoInclude],
                    },
                ],
                order: [
                    [{ model: Turma, as: 'turma' }, 'codigo', 'ASC'],
                    ['descricao', 'ASC'],
                ],
            })

            const resultado = diarios.map(d => ({
                ...d.toJSON(),
                plano: normalizar(d.plano),
            }))

            return res.status(200).json({
                etapas: PLANO_ETAPAS,
                diarios: resultado,
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    /**
     * PUT /plano/:id
     * Body: { plano: 1..6 }
     *
     * Regras:
     *   - Coordenador só altera diários do curso que coordena e só avança ou
     *     retrocede UMA etapa por vez (evita saltos acidentais no fluxo).
     *   - Supremo pode definir qualquer etapa, em qualquer curso.
     */
    atualizar = async (req, res) => {
        try {
            const novoPlano = Number(req.body.plano)

            if (!Number.isInteger(novoPlano) || novoPlano < PLANO_MIN || novoPlano > PLANO_MAX) {
                return res.status(400).json({
                    message: `Etapa inválida. Use um valor de ${PLANO_MIN} a ${PLANO_MAX}.`,
                })
            }

            const diario = await Diario.findByPk(req.params.id, {
                include: {
                    model: Turma,
                    as: 'turma',
                    include: { model: Curso, as: 'curso' },
                },
            })
            if (!diario) {
                return res.status(404).json({ message: 'Diário não encontrado.' })
            }

            const supremo = req.userCategoria === 1

            // Coordenador só mexe no próprio curso
            if (!supremo && diario.turma?.curso?.professor_id !== req.userProfessorId) {
                return res.status(403).json({ message: 'Acesso restrito aos diários do seu curso.' })
            }

            const planoAtual = normalizar(diario.plano)

            // Coordenador avança/retrocede uma etapa por vez
            if (!supremo && Math.abs(novoPlano - planoAtual) !== 1) {
                return res.status(400).json({
                    message: 'Avance ou retroceda uma etapa por vez.',
                })
            }

            await diario.update({ plano: novoPlano })

            return res.status(200).json({
                message: `Plano de ensino em "${PLANO_ETAPAS[novoPlano]}".`,
                id: diario.id,
                plano: novoPlano,
                anterior: planoAtual,
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new PlanoController()
