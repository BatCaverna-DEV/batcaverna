import banco from '../config/banco.js'
import Curso from "./Curso.js";
import Calendario from "./Calendario.js";

const Turma = banco.sequelize.define('turmas', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: banco.Sequelize.STRING(50),
        allowNull: false
    },
    descricao: {
        type: banco.Sequelize.STRING(100),
        allowNull: false
    },
    status:{
        type: banco.Sequelize.INTEGER,
        allowNull: false
    }
})

Turma.belongsTo(Curso, {
    foreignKey: 'curso_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'curso',
})

Turma.belongsTo(Calendario, {
    foreignKey: 'calendario_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'calendario',
})

export default Turma