//Importar Modulos, dependencias, modelos y servicios
const Publication= require("../models/publication")
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");



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
const getPublication = (req, res) => {

    // Recibir el id de la publicacion por la url
    const id = req.params.id;

    // Query para sacar los datos del usuario
    Publication.findById(id)
        .then(async (publication) => {
            
            if (!publication) {
                //La publicación no existe
                return res.status(404).send({
                    status: "error",
                    message: "Publicación no encontrado"
                })
            } else {
                // Devolver resultado
                return res.status(200).send({
                    status: "success",
                    message: "Publicacion encontrada satisfactoriamente",
                    publication: publication
                });
            }                 
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Error en la consulta." });
        });    
}

// 03. Listar publicaciones (Ordenado por fecha mas reciente)
const listPublications = (req, res) => {

    //Controlar en que pagina estamos y cuantos elementos por pagina mostrará
    let pagina= 1;
    let publicacionesPorPagina= 1000;

    if(req.params.pagina){
        pagina= parseInt(req.params.pagina);
    }
    if(req.params.publicationsPorPagina){
        publicacionesPorPagina= parseInt(req.params.publicationsPorPagina);
    }

    //Consulta con mongoose paginate
    Publication.find().sort({created_at:-1}).paginate(pagina, publicacionesPorPagina, (error, publications, total) =>{
        
        if (error) return res.status(500).json({ status: "error", message: "Error en la consulta." });

        if (!publications) return res.status(404).json({ status: "error", message: "No hay publicaciones" });


        // Devolver resultado
        return res.status(200).send({
        status: "succes",
        message: "Listado de publicaciones correcta",
        pagina: pagina,
        publicacionesPorPagina: publicacionesPorPagina,
        total_Paginas: Math.ceil(total/publicacionesPorPagina),
        total_Publicaciones: total,
        publicaciones: publications

        });

    })
}

// 04 . Eliminar publicaciones
const remove = (req, res) => {

    // Recoger el id de la url y comprobar que viene correctamente.
    let idEliminar = req.params.id;


    if (!idEliminar) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id de la publicacion a eliminar como paramentro en la URL."
        })
    }

    // Comprobar que el usuario que va a realizar el remove sea admin (role:1)
    const userLogueado = req.user;
    if (userLogueado.role != 1) {
        return res.status(401).send({
            status: "error",
            message: "Para eliminar una publicacion, el usuario logueado debe de tener rol de Admin."
        })
    }

    // Buscar ela publicación y si existe, eliminarlo
    Publication.find({"_id":idEliminar}).remove().then(async (publicationRenmoved) => {

        if (!publicationRenmoved && publicationRenmoved.length < 1) {
            //Si no se encuentra publicación
            return res.status(404).send({
                status: "error",
                message: "No se encuentra la publicación."
            })
        } else {

            //Devolver resultado
            return res.status(200).send({
                message: "Publicación eliminada correctamente",
                publication_renmoved: publicationRenmoved
            });
        }
    }).catch((err) => {

        console.log(err);
        return res.status(500).json({ status: "error", message: "Error en la consulta de publicaciones." , error });
    });

}

// 05. Subir imagen 
const uploadImage = (req, res)=> {

    // Recoger el id de la url y comprobar que viene correctamente.
    const publicationId = req.params.id;

    if (!publicationId) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id de la publicacion al que quiere subir una foto como paramentro en la URL."
        })
    }

    // Recoger el fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "La peticion no incluye la imagen"
        })
    }
    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1].toLowerCase();

    console.log(req.file.size);
    // Comprobar extension
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gift"){
        
        // SI no es correcto, borrar archivo
        const filePath = req.file.path; //Ruta donde segurarda el archivo
        fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalida"
        })

    } else if( req.file.size > 15000000){
        // SI el archivo pesa mas de 15MB lo borra
        const filePath = req.file.path; //Ruta donde segurarda el archivo

        fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "error",
            message: "El archivo pesa mas de 15MB, sube un archivo menos pesado"
        })

    } else{
        // Si es correcto, actualizar en la BBDD
        Publication.findOneAndUpdate({id: publicationId}, {file: req.file.filename.toLowerCase()}, {new:true}, (error, publicationUpdated) =>{

            console.log(error);
            if(error || !publicationUpdated){
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida de la imagen",
                    error: error
                })
            }

            //Devolver respuesta
            return res.status(200).send({
            status: "success",
            publicationUpdated: publicationUpdated,
            file: req.file
            });
        })
     
    }     
}

/// 06. Devolver archivo multimedia/ imagenes

const getImage = (req, res)=> {
    //Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filepath= "./uploads/publications/"+file;
    console.log(filepath);

    //Comprobar que existe
    fs.stat(filepath, (error, exist)=> {
        if(!exist){
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }
        if(error){
            return res.status(404).send({
                status: "error",  
                message: "Error al consular la BBDD",
                error: error
            })
        }
        //Devolver el archivo
        return res.sendFile(path.resolve(filepath));  
        //El path es un modulo que con su metodo .resolve me da la ruta absoluta
        
    })


}




// Exportar acciones
module.exports = {
    pruebaPublication,
    create,
    remove,
    getPublication,
    listPublications,
    uploadImage,
    getImage
}