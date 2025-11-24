import banco from '../config/banco.js'
import Diario from "./Diario.js";
import Dia from "./Dia.js";

const Horario = banco.sequelize.define('horarios', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ordem:{
        type: banco.Sequelize.INTEGER,
    },
    status: {
        type: banco.Sequelize.INTEGER,
    },
    turno:{
        type: banco.Sequelize.INTEGER,
    }
})

Horario.belongsTo(Diario, {
    foreignKey: 'diario_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'diario'
})

Horario.belongsTo(Dia, {
    foreignKey: 'dia_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'dia'
})


export default Horario