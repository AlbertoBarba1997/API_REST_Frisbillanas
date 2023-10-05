//Acciones de prueba

const pruebaContent = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/content.js"
    });
}

// Exportar acciones
module.exports = {
    pruebaContent
}