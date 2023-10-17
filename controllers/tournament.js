//Importar Modulos, dependencias, modelos y servicios
const Tournament= require("../models/tournament");
const Participation= require("../models/participation");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");



// 00. Acciones de prueba

const pruebaTournament = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/tournament.js"
    });
}


// 01. Alta torneo
const create = (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien (+validacion)
    if (!params.name || !params.place || !params.date ) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar el 'name', 'place' o 'date' del torneo por 'Body'"
        });
    }


    // Crear objeto de torneo
    let tournament_to_save = new Tournament(params);

    // Guardar torneo en la bbdd
    tournament_to_save.save((err, tournamentStored) => {
        if (err) {
            return res.status(400).send({
                status: "error",
                message: "Error guardando la torneo.",
                error: err
            });
        } else {
            //Devolver resultado
            return res.status(200).send({
                message: "Se ha guardado correctamente",
                tournament_stored: tournamentStored
            });
        }
    })
}
   


// 02. Detalles torneo
const getTournament = (req, res) => {

    // Recibir el id de el torneo por la url
    const idTournament = req.params.id;
    const idUser = req.user.id;

    // Query para sacar los datos del usuario
    Tournament.findById(idTournament)
        .then(async (tournament) => {
            
            if (!tournament) {
                //El torneo no existe
                return res.status(404).send({
                    status: "error",
                    message: "torneo no encontrado"
                })
            } else {
                // Paso previo, comprobar si el usuario logueado participa en el torneo el torneo
                let participa= await obtenerParticipacion(idTournament, idUser);

                // Devolver resultado
                return res.status(200).send({
                    status: "success",
                    message: "Publicacion encontrada satisfactoriamente",
                    participa: participa,
                    tournament: tournament
                    
                   
                });
            }                 
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Error en la consulta." });
        });    
}

// 03. Listar torneos (Ordenado por fecha mas reciente)
const listTournaments = (req, res) => {

    //Controlar en que pagina estamos y cuantos elementos por pagina mostrará
    let pagina= 1;
    let torneosPorPagina= 1000;

    if(req.params.pagina){
        pagina= parseInt(req.params.pagina);
    }
    if(req.params.tournamentsPorPagina){
        torneosPorPagina= parseInt(req.params.tournamentsPorPagina);
    }




    //Comprueba si trae algun parametro de búsqueda
    const searchParams=req.body;
    let haveSearchParams=false;
    let query=null;

    if(searchParams.name ||searchParams.gender || searchParams.modality){
        haveSearchParams=true;
        query= obtenerQueryBusqueda(req);
    }
    
    
    if (haveSearchParams) {

        //Consulta con mongoose paginate
        Tournament.find({ $and: [query] }).sort({ date: -1 }).paginate(pagina, torneosPorPagina, (error, tournaments, total) => {

            if (error) return res.status(500).json({ status: "error", message: "Error en la consulta." });

            if (!tournaments) return res.status(404).json({ status: "error", message: "No hay torneos" });


            // Devolver resultado
            return res.status(200).send({
                status: "succes",
                message: "Listado de torneos correcta",
                pagina: pagina,
                torneosPorPagina: torneosPorPagina,
                total_Paginas: Math.ceil(total / torneosPorPagina),
                total_Publicaciones: total,
                torneos: tournaments

            });

        })
    } else {
        //Consulta con mongoose paginate
        Tournament.find().sort({ date: -1 }).paginate(pagina, torneosPorPagina, (error, tournaments, total) => {

            if (error) return res.status(500).json({ status: "error", message: "Error en la consulta." });

            if (!tournaments) return res.status(404).json({ status: "error", message: "No hay torneos" });


            // Devolver resultado
            return res.status(200).send({
                status: "succes",
                message: "Listado de torneos correcta",
                pagina: pagina,
                torneosPorPagina: torneosPorPagina,
                total_Paginas: Math.ceil(total / torneosPorPagina),
                total_Publicaciones: total,
                torneos: tournaments

            });

        })
    }

    
}

// 04 . Eliminar torneos
const remove = (req, res) => {

    // Recoger el id de la url y comprobar que viene correctamente.
    let idEliminar = req.params.id;


    if (!idEliminar) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id de el torneo a eliminar como paramentro en la URL."
        })
    }

    // Comprobar que el usuario que va a realizar el remove sea admin (role:1)
    const userLogueado = req.user;
    if (userLogueado.role != 1) {
        return res.status(401).send({
            status: "error",
            message: "Para eliminar un torneo, el usuario logueado debe de tener rol de Admin."
        })
    }

    // Buscar el torneo y si existe, eliminarlo
    Tournament.find({"_id":idEliminar}).remove().then(async (tournamentRenmoved) => {

        if (!tournamentRenmoved && tournamentRenmoved.length < 1) {
            //Si no se encuentra torneo
            return res.status(404).send({
                status: "error",
                message: "No se encuentra el torneo."
            })
        } else {

            //Devolver resultado
            return res.status(200).send({
                message: "Torneo eliminado correctamente",
                tournament_renmoved: tournamentRenmoved
            });
        }
    }).catch((err) => {

        console.log(err);
        return res.status(500).json({ status: "error", message: "Error en la consulta." , error });
    });

}

// 05. Subir imagen 
const uploadImage = (req, res)=> {

    // Recoger el id de la url y comprobar que viene correctamente.
    const tournamentId = req.params.id;

    if (!tournamentId) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id del torneo al que quiere subir una foto como paramentro en la URL."
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
        Tournament.findOneAndUpdate({"_id": tournamentId}, {file: req.file.filename.toLowerCase()}, {new:true}, (error, tournamentUpdated) =>{

            
            if(error || !tournamentUpdated){
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida de la imagen",
                    error: error
                })
            }

            //Devolver respuesta
            return res.status(200).send({
            status: "success",
            tournamentUpdated: tournamentUpdated,
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
    const filepath= "./uploads/tournaments/"+file;
    

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


function obtenerQueryBusqueda(req){
    let query={};
    const { name, gender, modality} = req.body;
    /*
    query= {
        $and: [
            
        ]
    };
    */
   if(name) query.name= { $regex: new RegExp(name, 'i') };
   if(gender) query.gender = gender;
   if(modality) query.modality = modality;
    return query;


}

async function obtenerParticipacion(idTournament, idUser){
    let participa=false;
    try{
        let participation= await Participation.find({ user:idUser , tournament:idTournament}).exec();
        if(participation.length>0) participa=true;
    }catch (error){
        return false;
    }

    return participa;


}



// Exportar acciones
module.exports = {
    pruebaTournament,
    create,
    remove,
    getTournament,
    listTournaments,
    uploadImage,
    getImage
}