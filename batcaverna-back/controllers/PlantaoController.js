import { QueryTypes } from 'sequelize'
import banco       from '../config/banco.js'
import TipoPlantao from '../models/TipoPlantao.js'
import Semestre    from '../models/Semestre.js'
import Escala      from '../models/Escala.js'
import FilaGeral   from '../models/FilaGeral.js'
import Professor   from '../models/Professor.js'

const TIPOS_PADRAO = [
    { nome: '7 Horas da Manhã',  descricao: 'Plantão às 7h da manhã' },
    { nome: 'Sexta à Tarde',     descricao: 'Plantão na sexta-feira à tarde' },
    { nome: '3 Noites',          descricao: 'Plantão em três noites consecutivas' },
]

class PlantaoController {

    // ── Tipos ─────────────────────────────────────────────────

    indexTipos = async (req, res) => {
        try {
            // Semeie os tipos padrão se ainda não existirem
            for (const t of TIPOS_PADRAO) {
                await TipoPlantao.findOrCreate({ where: { nome: t.nome }, defaults: { ...t, ativo: true } })
            }
            const tipos = await TipoPlantao.findAll({ where: { ativo: true }, order: [['nome', 'ASC']] })
            return res.status(200).json(tipos)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    // ── Semestres ─────────────────────────────────────────────

    indexSemestres = async (req, res) => {
        try {
            const semestres = await Semestre.findAll({ order: [['ano', 'DESC'], ['periodo', 'DESC']] })
            return res.status(200).json(semestres)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    criarSemestre = async (req, res) => {
        try {
            const { ano, periodo } = req.body
            const existente = await Semestre.findOne({ where: { ano, periodo } })
            if (existente) return res.status(409).json({ message: 'Semestre já cadastrado.' })
            const semestre = await Semestre.create({ ano, periodo })
            return res.status(200).json(semestre)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    // ── Fila do semestre ──────────────────────────────────────

    filaDoSemestre = async (req, res) => {
        try {
            const { semestre_id } = req.params
            const tipos = await TipoPlantao.findAll({ where: { ativo: true }, order: [['nome', 'ASC']] })

            const resultado = []
            for (const tipo of tipos) {
                const escalas = await banco.sequelize.query(`
                    SELECT e.id, e.professor_id, e.foi_voluntario, e.data_realizado,
                           e.status, e.observacao, p.nome, p.siape
                    FROM escalas e
                    JOIN professores p ON p.id = e.professor_id
                    WHERE e.semestre_id = :semestre_id
                      AND e.tipo_plantao_id = :tipo_id
                    ORDER BY p.nome ASC
                `, {
                    replacements: { semestre_id, tipo_id: tipo.id },
                    type: QueryTypes.SELECT,
                })
                resultado.push({ tipo: tipo.toJSON(), escalas })
            }

            return res.status(200).json(resultado)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    // ── Fila geral ────────────────────────────────────────────

    indexFilaGeral = async (req, res) => {
        try {
            await this._sincronizarProfessores()
            const fila = await banco.sequelize.query(`
                SELECT fg.id, fg.professor_id, fg.total_plantoes, fg.creditos_voluntariado,
                       p.nome, p.siape,
                       CASE WHEN s.id IS NOT NULL THEN CONCAT(s.ano, '/', s.periodo) END AS ultimo_semestre
                FROM fila_geral fg
                JOIN professores p ON p.id = fg.professor_id
                LEFT JOIN semestres s ON s.id = fg.ultimo_semestre_id
                WHERE p.status = 1
                ORDER BY fg.total_plantoes ASC, fg.creditos_voluntariado DESC, p.nome ASC
            `, { type: QueryTypes.SELECT })
            return res.status(200).json(fila)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    _sincronizarProfessores = async () => {
        const professores = await Professor.findAll({ where: { status: 1 } })
        for (const p of professores) {
            await FilaGeral.findOrCreate({
                where: { professor_id: p.id },
                defaults: { professor_id: p.id, total_plantoes: 0, creditos_voluntariado: 0 },
            })
        }
    }

    // ── Escalas ───────────────────────────────────────────────

    adicionarEscala = async (req, res) => {
        try {
            const { professor_id, tipo_plantao_id, semestre_id, foi_voluntario } = req.body
            const existente = await Escala.findOne({ where: { professor_id, tipo_plantao_id, semestre_id } })
            if (existente) return res.status(409).json({ message: 'Professor já escalado para este tipo neste semestre.' })

            const escala = await Escala.create({
                professor_id, tipo_plantao_id, semestre_id,
                foi_voluntario: !!foi_voluntario,
            })
            return res.status(200).json(escala)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    atualizarEscala = async (req, res) => {
        try {
            const escala = await Escala.findByPk(req.params.id)
            if (!escala) return res.status(404).json({ message: 'Escala não encontrada.' })

            const statusAnterior = escala.status
            const { status, data_realizado, observacao, foi_voluntario } = req.body

            await escala.update({ status, data_realizado, observacao, foi_voluntario })

            const foiConcluido   = ['cumprido', 'trocado'].includes(status)
            const eraInconcluido = !['cumprido', 'trocado'].includes(statusAnterior)

            // Incrementa contagem ao marcar como concluído pela primeira vez
            if (foiConcluido && eraInconcluido) {
                const fg = await FilaGeral.findOne({ where: { professor_id: escala.professor_id } })
                if (fg) {
                    const updates = {
                        total_plantoes: fg.total_plantoes + 1,
                        ultimo_semestre_id: escala.semestre_id,
                    }
                    if (escala.foi_voluntario) updates.creditos_voluntariado = fg.creditos_voluntariado + 1
                    await fg.update(updates)
                }
            }

            // Decrementa ao reverter para status não-concluído
            if (!foiConcluido && !eraInconcluido) {
                const fg = await FilaGeral.findOne({ where: { professor_id: escala.professor_id } })
                if (fg && fg.total_plantoes > 0) {
                    const updates = { total_plantoes: fg.total_plantoes - 1 }
                    if (escala.foi_voluntario && fg.creditos_voluntariado > 0)
                        updates.creditos_voluntariado = fg.creditos_voluntariado - 1
                    await fg.update(updates)
                }
            }

            return res.status(200).json(escala)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    removerEscala = async (req, res) => {
        try {
            const escala = await Escala.findByPk(req.params.id)
            if (!escala) return res.status(404).json({ message: 'Escala não encontrada.' })
            await escala.destroy()
            return res.status(200).json({ message: 'Escala removida.' })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}

export default new PlantaoController()
