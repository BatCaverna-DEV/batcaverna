import banco from '../config/banco.js'

const FilaGeral = banco.sequelize.define('fila_geral', {
    id: {
        type: banco.Sequelize.CHAR(36),
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    professor_id: {
        type: banco.Sequelize.CHAR(36),
        allowNull: false,
    },
    ultimo_semestre_id: {
        type: banco.Sequelize.CHAR(36),
    },
    total_plantoes: {
        type: banco.Sequelize.INTEGER,
        defaultValue: 0,
    },
    creditos_voluntariado: {
        type: banco.Sequelize.INTEGER,
        defaultValue: 0,
    },
}, { timestamps: false })

export default FilaGeral
