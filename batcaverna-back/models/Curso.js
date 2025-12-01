import banco from '../config/banco.js'
import Professor from "./Professor.js";

const Curso = banco.sequelize.define('cursos', {
    id:{
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
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

Curso.belongsTo(Professor, {
    foreignKey: 'professor_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'professor'
})
export default Curso