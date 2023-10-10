const Publication= require("../models/publication")


// 00. Acciones de prueba

const pruebaPublication = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}


// 01. Alta publicacion
const create = (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien (+validacion)
    if (!params.tittle || !params.text) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar el 'tittle' o el 'text' de la publicacion por 'Body'"
        });
    }

    // Crear objeto de publicacion
    let publication_to_save = new Publication(params);
    
    // Añadirle el usuario que ha creado el post
    try{ 
        publication_to_save.user = req.user.name;
    }catch(err) {
        publication_to_save.user = "";
    }
    

    // Guardar publicacion en la bbdd
    publication_to_save.save((err, publicationStored) => {
        if (err) {
            return res.status(400).send({
                status: "error",
                message: "Error guardando la publicacion.",
                error: err
            });
        } else {
            //Devolver resultado
            return res.status(200).send({
                message: "Se ha guardado correctamente",
                publication_stored: publicationStored
            });
        }
    })
}
   


// 02. Detalles publicación


// 03. Listar publicaciones


// 04 . Eliminar publicaciones


// 05. Subir ficheros


// 06. Devolver archivo multimedia/ imagenes






// Exportar acciones
module.exports = {
    pruebaPublication,
    create 
}