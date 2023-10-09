// Importar dependencias 
const jwt = require("jwt-simple");
const moment = require("moment");


//Contraseña secreta
const clave_secreta= "CLAVE_SECRETA_PROYECTO_Juan_Alberto_77664";

// Crear una funcion para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        user : user.user,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        created_at: user.created_at,
        avatar: user.avatar,
        iat: moment().unix(),  //fecha de creacion del token
        exp: moment().add(30, "days").unix()  //fecha de expiracion del token (en 30 dias)
 
    }

    return jwt.encode(payload, clave_secreta);

}


// Exportar acciones
module.exports = {
    clave_secreta,
    createToken
    
}


