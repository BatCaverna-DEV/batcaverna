import banco from '../config/banco.js'
import Professor from './Professor.js'

const Usuario = banco.sequelize.define('usuarios', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: banco.Sequelize.STRING(100),
        allowNull: false
    },
    password: {
        type: banco.Sequelize.STRING(250),
        allowNull: true
    },
    categoria:{
        type: banco.Sequelize.INTEGER,
        default: 0
    },
    status: {
        type: banco.Sequelize.INTEGER,
        default: 0
    },
    codigo: {
        type: banco.Sequelize.STRING(20),
        default: null
    }
})

await Usuario.belongsTo(Professor, {
    foreignKey: 'professor_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'professor',
})

await Professor.hasOne(Usuario, {
    foreignKey: 'professor_id',
    as: 'usuario'
});

export default Usuario