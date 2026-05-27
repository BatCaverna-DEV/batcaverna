import Professor from '../models/Professor.js'
import Usuario   from '../models/Usuario.js'
import Diario    from '../models/Diario.js'
import Turma     from '../models/Turma.js'
import { Op }    from 'sequelize'

class ProfessorController {

    index = async (req, res)=>{
        const mostrarInativos = req.query.inativos === 'true'

        const where = mostrarInativos ? {} : { status: { [Op.ne]: 3 } }

        const professores = await Professor.findAll({
            where,
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'username', 'categoria', 'status']
            }],
            order: [['nome', 'ASC']],
        })
        return res.status(200).json(professores)
    }

    cadastrar = async (req, res)=>{
        console.log('Iniciou o cadastro...')
        const professor = req.body

        const p = await Professor.findOne({
            where: {
                [Op.or]: [
                    { siape: professor.siape },
                    { email: professor.email }
                ]
            }
        })

        if(p){
            return await res.status(501).json({message:"SIAPE e/ou E-mail já cadastrados!"});
        }
        console.log('Verificou todos os erros!')
        professor.status = 1
        Professor.create(professor).then(async (professor)=>{
            const usuario = {
                username:     professor.siape,
                email:        professor.email,
                categoria:    0,   // sem acesso; promoção feita pelo Supremo
                status:       1,
                professor_id: professor.id,
            }
            const u = await Usuario.create(usuario)
            return res.status(200).json(professor)
        }).catch((err)=>{
            console.log('ERRO: '+err.message);
            return res.status(500).json({message: err.message})
        })

    }//Fim do Cadastro

    /**
     * GET /professor/carga
     * Retorna todos os professores ativos com o total de aulas semanais
     * e a lista de diários assumidos, ordenados pela carga decrescente.
     */
    cargaHoraria = async (req, res) => {
        try {
            const professores = await Professor.findAll({
                where: { status: 1 },
                order: [['nome', 'ASC']],
            })

            const diarios = await Diario.findAll({
                where: {
                    status:       1,
                    professor_id: { [Op.not]: null },
                },
                attributes: ['id', 'codigo', 'descricao', 'aulas_semana', 'carga', 'professor_id'],
                include: [{ model: Turma, as: 'turma', attributes: ['codigo', 'descricao'] }],
                order: [['descricao', 'ASC']],
            })

            // Agrupa diários por professor
            const mapDiarios = {}
            for (const d of diarios) {
                if (!mapDiarios[d.professor_id]) mapDiarios[d.professor_id] = []
                mapDiarios[d.professor_id].push(d.toJSON())
            }

            const resultado = professores.map(p => {
                const ds = mapDiarios[p.id] ?? []
                return {
                    ...p.toJSON(),
                    diarios:      ds,
                    qtd_diarios:  ds.length,
                    aulas_semana: ds.reduce((acc, d) => acc + (d.aulas_semana ?? 0), 0),
                }
            })

            // Ordena: maior carga primeiro, depois alfabético
            resultado.sort((a, b) => b.aulas_semana - a.aulas_semana || a.nome.localeCompare(b.nome))

            return res.status(200).json(resultado)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    alterarStatus = async (req, res) => {
        try {
            const { id } = req.params
            const { status } = req.body

            if (![1, 2, 3].includes(Number(status))) {
                return res.status(400).json({ message: 'Status inválido. Use 1 (Ativo), 2 (Afastado) ou 3 (Inativo).' })
            }

            const professor = await Professor.findByPk(id, {
                include: [{ model: Usuario, as: 'usuario' }]
            })
            if (!professor) return res.status(404).json({ message: 'Professor não encontrado.' })

            if (professor.usuario?.categoria === 1) {
                return res.status(403).json({ message: 'Não é possível alterar o status do Supremo.' })
            }

            await professor.update({ status: Number(status) })

            return res.status(200).json({ message: 'Status atualizado com sucesso.', status: professor.status })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    promover = async (req, res) => {
        try {
            const { id } = req.params

            const professor = await Professor.findByPk(id, {
                include: [{ model: Usuario, as: 'usuario' }]
            })
            if (!professor) return res.status(404).json({ message: 'Professor não encontrado' })

            const usuario = professor.usuario
            if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' })

            if (usuario.categoria === 1)
                return res.status(403).json({ message: 'Não é possível alterar o papel do Supremo' })

            const novaCategoria = usuario.categoria === 2 ? 0 : 2
            await usuario.update({ categoria: novaCategoria })

            const mensagem = novaCategoria === 2
                ? 'Professor promovido a Coordenador com sucesso'
                : 'Coordenador rebaixado a Professor com sucesso'

            return res.status(200).json({ message: mensagem, categoria: novaCategoria })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

}//Fim da Classe

export default new ProfessorController()