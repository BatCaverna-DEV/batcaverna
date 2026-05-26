import banco from '../config/banco.js'
import Professor from './Professor.js'
import Motivo from './Motivo.js'
import Calendario from './Calendario.js'

const Fila = banco.sequelize.define('filas', {
    id: {
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
})

Fila.belongsTo(Professor, {
    foreignKey: 'professores_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'professor',
})

Fila.belongsTo(Motivo, {
    foreignKey: 'motivos_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'motivo',
})

Fila.belongsTo(Calendario, {
    foreignKey: 'calendarios_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'calendario',
})

export default Fila
