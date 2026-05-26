import banco from '../config/banco.js'

const Motivo = banco.sequelize.define('motivos', {
    id: {
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    descricao: {
        type: banco.Sequelize.STRING(100),
        allowNull: false,
    },
    status: {
        type: banco.Sequelize.INTEGER,
    },
})

export default Motivo
