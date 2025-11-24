import banco from '../config/banco.js'
import Professor from "./Professor.js";
import Turma from "./Turma.js";

const Diario = banco.sequelize.define('diarios', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo:{
        type: banco.Sequelize.INTEGER,
        allowNull: false
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
    horario:{
        type: banco.Sequelize.STRING(20),
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