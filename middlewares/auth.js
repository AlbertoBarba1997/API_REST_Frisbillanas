// Importar moduilos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.clave_secreta;

// Funcion autenticacion
const auth = (req, res, next) =>{
    //comprobar si me llega la cabecera auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion (Introducir el Token generado en login en 'Headers', con la key 'Authorization' )"
        });

    }
    // Decodificar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');  // Limpiar formato del token
    let payload;
    try{
        payload= jwt.decode(token, secret);

        //Comprobar expiracion
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                estatus: "error",
                message: "Token expirado"
            })
        }
        // Agregar datos de user logueado a la misma request
        req.user = payload; 

    }catch(error){
        return res.status(404).send({
            estatus: "error",
            message: "Token invalido",
            error
        })
    }


    

    // Pasar a ejecucion de accion (la funcion del controlador)
    next();

}

module.exports= {
    auth

}

