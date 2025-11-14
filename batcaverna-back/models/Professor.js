import banco from '../config/banco.js'

const Professor = banco.sequelize.define('professores', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: banco.Sequelize.STRING(100),
        allowNull: false
    },
    siape: {
        type: banco.Sequelize.STRING(20),
        allowNull: false
    },
    email:{
        type: banco.Sequelize.STRING(100),
        allowNull: false
    },
    status: {
        type: banco.Sequelize.INTEGER,
    }
})

export default Professor