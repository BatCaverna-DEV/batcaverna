import banco from '../config/banco.js'
import Calendario from "./Calendario.js";

const Dia = banco.sequelize.define('dias', {
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    data:{
        type: banco.Sequelize.DATE,
        allowNull: false
    },
    dia: {
        type: banco.Sequelize.STRING(100),
        allowNull: false
    }
})

Dia.belongsTo(Calendario, {
    foreignKey: 'calendario_id',
    constraint: true,
    onDelete: 'CASCADE',
    as: 'calendario'
})


export default Dia