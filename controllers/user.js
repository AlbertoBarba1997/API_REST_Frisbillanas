//Dependencias y modulos importados
const bcrypt = require("bcrypt");
const User = require("../models/user");

//Acciones de prueba

const pruebaUser = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js"
    });
}


/// 01. Alta de usuario
const register = (req, res)=> {

    // Recoger datos de la peticion
    let params = req.body;
    
    // Compropbar que me llegan bien (+validacion)
    if( !params.email  || !params.name  || !params.dni || !params.phone  ){
        return res.status(400).send({
            status:"error",
            message: "Faltan datos por enviar",
            params
        });
    }

    // En caso de que no venga una password definida, poner como contraseña el DNI encriptado.
    if(!params.password){
        params.password=params.dni;
    }

    // Pasar a minusculas y sin espacios en blanco: Email, dni y telefono
    params.email= params.email.toLowerCase().trim();
    params.dni = params.dni.toLowerCase().trim();
    params.phone = params.phone.trim();

    // Control usuarios duplicados
    User.find({
        $or: [
            { email: params.email }
            ,{ dni: params.dni },
        ]
    }).then(async (users) => {

        if (users && users.length >= 1) {
            //Si ya existe un usuario
            return res.status(200).send({
                status: "duplicate",
                message: "El usuario ya existe"
            })
        } else {
            //Si no existe ,se crea el usuario
            // Cifrar contraseña
            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            // Crear objeto de usuario
            let user_to_save = new User(params);

            // Guardar usuario en la bbdd
            user_to_save.save((err, userStored) => {
                if (err) {
                    return res.status(400).send({
                        status: "error",
                        message: "Faltan datos por enviar",
                        params
                    });
                } else {
                    //Devolver resultado
                    return res.status(200).send({
                        message: "Se ha guardado correctamente",
                        user_stored: userStored
                    });
                }
            })
        }
    }).catch((err) => {

        console.log(err);
        return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios." });
    });

}



// Exportar acciones
module.exports = {
    pruebaUser,
    register
}