//Acciones de prueba

const pruebaTournament = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/tournament.js"
    });
}

// Exportar acciones
module.exports = {
    pruebaTournament
}