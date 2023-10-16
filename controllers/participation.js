//Importar Modulos, dependencias, modelos y servicios
const Participation= require("../models/participation");
const Tournament= require("../models/tournament");
const User= require("../models/user");




// 00. Acciones de prueba

const pruebaParticipation = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/participation.js"
    });
}


// 01. Alta participacion 
const create = (req, res) => {

    // Recoger datos de la peticion (por un lado el usuario logeado que esta en el Token, y por otro el id de Torneo)
    const params = req.body;
    const userIdentificado = req.user;

    // Comprobar que me llegan bien (+validacion)
    if (!params.tournament) {
        return res.status(400).send({
            status: "error",
            message: "Falta el dato por enviar de 'tournament' por 'Body'"
        });
    }

    // Crear el objeto participacion con los ids de usuario y torneo
    let participacion=new Participation();
    participacion.user= userIdentificado.id;    //Es 'id' y no '_id' como en la BD porque asi lo he alamacenado en el token en jwt.js
    participacion.tournament = params.tournament;

    

    // Guardar participacion en la bbdd
    participacion.save((err, participationStored) => {
        if (err) {
            return res.status(400).send({
                status: "error",
                message: "Error guardando la participacion.",
                error: err
            });
        } else {
            //Devolver resultado
            return res.status(200).send({
                message: "Se ha guardado correctamente",
                participation_stored: participationStored
            });
        }
    })
}



// 02 . Eliminar participacion
const remove = (req, res) => {

    // Recoger el id de la url y comprobar que viene correctamente.
    let idEliminar = req.params.id;


    if (!idEliminar) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id de la participacion a eliminar como paramentro en la URL."
        })
    }

    // Buscar la participacion y si existe, eliminarlo
    Participation.find({"_id":idEliminar}).deleteOne().then(async (participationRenmoved) => {

        if (!participationRenmoved || participationRenmoved.deletedCount < 1) {
            //Si no se encuentra la participacion
            return res.status(404).send({
                status: "error",
                message: "No se encuentra la participacion."
            })
        } else {

            //Devolver resultado
            return res.status(200).send({
                message: "Participacion eliminada correctamente",
                tournament_renmoved: participationRenmoved
            });
        }
    }).catch((err) => {

        console.log(err);
        return res.status(500).json({ status: "error", message: "Error en la consulta." , error });
    });

}
   



// 03. Listar participantes de un torneo 
const listTournamentsUser = async (req, res) => {

  
    // Obtener el id del jugador logeado, en caso de que manden por parametros el id de otro jugador, cogeremos ese otro jugador
    const idUser=req.params.idUser;

    if (!idUser) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id de la participacion a eliminar como paramentro en la URL."
        })
    }
    

    //Consulta conce traiga los usuarios, pero solo con su id, nombre y avatar.
    Participation.find({ "user": idUser }, "-user -create_at -__v").populate("tournament" , "name file" ).exec((error, participations) =>{

        if (!participations || participations.length<1) {
            //El usuario no existe
            return res.status(404).send({
                status: "Not found",
                message: "No se han encontrado participaciones de este usuario"
            })
        } else {
            // Devolver resultado
            return res.status(200).send({
                status: "success",
                total: participations.length,
                message: "Listado de participaciones de este jugador:",
                participations: participations,
                
            });
        }              

    })
    
       
}


// 04. Listar torneos en los que participa un jugador
const listUsersTournament = async (req, res) => {

  
    // Recoger el id de la url y comprobar que viene correctamente.
    let idTorneo = req.params.idTournament;

    if (!idTorneo) {
        return res.status(400).send({
            status: "error",
            message: "Debe de enviar el id del torneo consultado como paramentro en la URL."
        })
    }

    //Consulta conce traiga los usuarios, pero solo con su id, nombre y avatar.
    Participation.find({ "tournament": idTorneo }, "-tournament -create_at -__v").populate("user" , "name avatar" ).exec((error, participations) =>{

        if (!participations || participations.length<1) {
            //El usuario no existe
            return res.status(404).send({
                status: "Not found",
                message: "No se han encontrado participaciones para este torneo"
            })
        } else {
            // Devolver resultado
            return res.status(200).send({
                status: "success",
                total: participations.length,
                message: "Listado de participaciones en este torneo:", 
                participations: participations,
                
            });
        }              

    })
    
       
}





// Exportar acciones
module.exports = {
    pruebaParticipation,
    create,
    remove,
    listUsersTournament,
    listTournamentsUser
}