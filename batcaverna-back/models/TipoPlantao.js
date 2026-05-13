import banco from '../config/banco.js'

const TipoPlantao = banco.sequelize.define('tipos_plantao', {
    id: {
        type: banco.Sequelize.CHAR(36),
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    nome: {
        type: banco.Sequelize.STRING(80),
        allowNull: false,
    },
    descricao: {
        type: banco.Sequelize.TEXT,
    },
    ativo: {
        type: banco.Sequelize.BOOLEAN,
        defaultValue: true,
    },
}, { timestamps: false })

export default TipoPlantao
