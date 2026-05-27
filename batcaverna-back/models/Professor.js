import banco from '../config/banco.js'

const Professor = banco.sequelize.define('professores', {
    id:{
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
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
    },
    tipo: {
        type: banco.Sequelize.INTEGER,  // 1=Docente, 2=Administrador
    }
})

export default Professor