import banco from '../config/banco.js'

const Calendario = banco.sequelize.define('calendarios', {

    id:{
        type: banco.Sequelize.UUID,
        defaultValue: banco.Sequelize.UUIDV4,
        primaryKey: true,
    },
    descricao:{
        type: banco.Sequelize.STRING(100),
    },
    ano:{
        type: banco.Sequelize.INTEGER,
    },
    semestre:{
        type: banco.Sequelize.INTEGER,
    },
    status:{
        type: banco.Sequelize.INTEGER,
    },
    inicio:{
        type: banco.Sequelize.DATEONLY,
    },
    fim:{
        type: banco.Sequelize.DATEONLY,
    }

})

export default Calendario