const mongoose = require("mongoose");

var urlBBDD = 'mongodb://127.0.0.1:27017/frisbillanas';

const connection = async() => {

    try {
        await mongoose.connect(urlBBDD);

        console.log("Conectado correctamente a la bd : fisbillanas");
    
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos!! "+ error);
    }
}

module.exports = {
    connection
}