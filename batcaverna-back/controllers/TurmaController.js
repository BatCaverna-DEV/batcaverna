import Turma from '../models/Turma.js'
import Diario from '../models/Diario.js'
import Professor from '../models/Professor.js'
import Calendario from '../models/Calendario.js'
import Curso from '../models/Curso.js'
import banco from '../config/banco.js'

class TurmaController {

    index = async (req, res) => {
        const id = req.params.id // id do coordenador
        const turmas = await Turma.findAll({
            where: { status: 1 },
            include: [
                { model: Calendario, as: 'calendario' },
                {
                    model: Curso,
                    as: 'curso',
                    include: { model: Professor, as: 'professor' },
                    where: { professor_id: id },
                },
            ],
        })

        // Conta diários ativos por turma em uma única query
        const contagens = await Diario.findAll({
            where: {
                turma_id: turmas.map(t => t.id),
                status: 1,
            },
            attributes: [
                'turma_id',
                [banco.sequelize.fn('COUNT', banco.sequelize.col('id')), 'qtd'],
            ],
            group: ['turma_id'],
            raw: true,
        })

        const countMap = {}
        contagens.forEach(c => { countMap[c.turma_id] = parseInt(c.qtd) })

        const resultado = turmas.map(t => ({
            ...t.toJSON(),
            qtd_diarios: countMap[t.id] ?? 0,
        }))

        return res.status(200).json(resultado)
    }//Fim do Index

    cadastrar = async (req, res) => {

        const turma = req.body
        turma.status = 1
        Turma.create(turma).then((turma)=>{
            res.status(201).json(turma)
        }).catch((err)=>{
            res.status(500).json(err)
        })

    }

    atualizar = async (req, res) => {
        const { codigo, descricao, curso_id, calendario_id } = req.body
        try {
            const turma = await Turma.findByPk(req.params.id)
            if (!turma) {
                return res.status(404).json({ message: 'Turma não encontrada.' })
            }
            await turma.update({
                codigo:        codigo        ?? turma.codigo,
                descricao:     descricao     ?? turma.descricao,
                curso_id:      curso_id      ?? turma.curso_id,
                calendario_id: calendario_id ?? turma.calendario_id,
            })
            return res.status(200).json(turma)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

    deletar = async (req, res) => {
        try {
            const turma = await Turma.findByPk(req.params.id)
            if (!turma) {
                return res.status(404).json({ message: 'Turma não encontrada.' })
            }

            // Exclui todos os diários vinculados antes de remover a turma
            const diariosExcluidos = await Diario.destroy({ where: { turma_id: turma.id } })

            await turma.destroy()

            return res.status(200).json({
                message: 'Turma excluída com sucesso.',
                diariosExcluidos,
            })
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }

}

export default new TurmaController()