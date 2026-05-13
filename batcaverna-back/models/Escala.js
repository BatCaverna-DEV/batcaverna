import banco from '../config/banco.js'

const Escala = banco.sequelize.define('escalas', {
    id: {
        type: banco.Sequelize.CHAR(36),
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    professor_id: {
        type: banco.Sequelize.CHAR(36),
        allowNull: false,
    },
    tipo_plantao_id: {
        type: banco.Sequelize.CHAR(36),
        allowNull: false,
    },
    semestre_id: {
        type: banco.Sequelize.CHAR(36),
        allowNull: false,
    },
    foi_voluntario: {
        type: banco.Sequelize.BOOLEAN,
        defaultValue: false,
    },
    data_realizado: {
        type: banco.Sequelize.DATEONLY,
    },
    status: {
        type: banco.Sequelize.ENUM('agendado', 'cumprido', 'trocado', 'abonado'),
        defaultValue: 'agendado',
    },
    observacao: {
        type: banco.Sequelize.TEXT,
    },
}, { timestamps: false })

export default Escala
