import banco from '../config/banco.js'

const Semestre = banco.sequelize.define('semestres', {
    id: {
        type: banco.Sequelize.CHAR(36),
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    ano: {
        type: banco.Sequelize.INTEGER,
        allowNull: false,
    },
    periodo: {
        type: banco.Sequelize.TINYINT,
        allowNull: false,
    },
}, { timestamps: false })

export default Semestre
