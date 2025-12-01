import banco from '../config/banco.js'
import Calendario from "./Calendario.js";

const Dia = banco.sequelize.define('dias', {
    id:{
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
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