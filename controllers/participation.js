//Acciones de prueba

const pruebaParticipation = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/participationn.js"
    });
}

// Exportar acciones
module.exports = {
    pruebaParticipation
}