import banco from '../config/banco.js'
import Professor from "./Professor.js";
import Turma from "./Turma.js";

const Diario = banco.sequelize.define('diarios', {
    id:{
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    codigo:{
        type: banco.Sequelize.INTEGER,
        allowNull: true
    },
    descricao: {
        type: banco.Sequelize.STRING(100),
        allowNull: false
    },
    status:{
        type: banco.Sequelize.INTEGER,
        allowNull: false
    },
    carga:{
        type: banco.Sequelize.INTEGER,
    },
    ministrada:{
        type: banco.Sequelize.INTEGER,
    },
    aulas_semana:{
        type: banco.Sequelize.INTEGER,
    },
    // Status do plano de ensino:
    // 1=Pendente, 2=Entregue ao Pedagógico, 3=Revisado pelo Pedagógico,
    // 4=Entregue ao Conselho, 5=Aprovado pelo Conselho, 6=Inserido no Diário
    plano:{
        type: banco.Sequelize.INTEGER,
        defaultValue: 1,
    }
})

Diario.belongsTo(Professor, {
    foreignKey: 'professor_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'professor'
})

Diario.belongsTo(Turma, {
    foreignKey: 'turma_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'turma'
})

export default Diario