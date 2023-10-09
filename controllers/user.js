//Importar Modulos, dependencias, modelos y servicios
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");



//Acciones de prueba

const pruebaUser = (req, res)=> {

    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
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
            let pwd = await bcrypt.hash(params.password.toLowerCase(), 10);
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

/// 02. Login 
const login = (req, res)=> {

    // Recoger parametros de la peticion
    let params = req.body;

    // Comprobar que vienen los datos bien
    if( !params.email  || !params.password  ){
        return res.status(400).send({
            status:"error",
            message: "Faltan datos por enviar",
            params
        });
    }
    // Buscar en la bbdd si existe email
    User.findOne({ email: params.email})
        .then(async (user) => {
            console.log("user: " + user);
            if (!user) {
                //El usuario no existe
                return res.status(404).send({
                    status: "error",
                    message: "El usuario no está registrado"
                })
            } else {
                // Comprobar su contraseña (cifrada)
                console.log(" params.pasword " + params.password  + " user.password " +user.password);
                const pwd = bcrypt.compareSync(params.password, user.password);

                if(!pwd){
                    return res.status(400).send({
                        status: "error",
                        message: "Contraseña incorrecta"
                    })
                }

                // Generar TOKEN
                const token= jwt.createToken(user);

                // Devolver token y datos del usuario
                return res.status(200).send({
                    status: "succes",
                    message: "Log-in correcto.",
                    user:{
                        id: user._id,
                        name: user.name,
                        email: user.email
                    },
                    token: token    
                });
            }                 
        }).catch((err) => {

            console.log(err);
            return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios." });
        });


}


// 03. Detalle de Usuario
const getUser = (req, res) => {

    // Recibir el id del usuario por la url
    const id = req.params.id;

    // Query para sacar los datos del usuario
    User.findById(id)
        .select({password:0, role:0})
        .then(async (user) => {
            console.log("user: " + user);
            if (!user) {
                //El usuario no existe
                return res.status(404).send({
                    status: "error",
                    message: "Usuario no encontrado"
                })
            } else {
                // Devolver resultado
                return res.status(200).send({
                    status: "succes",
                    message: "Usuario encontrado satisfactoriamente",
                    user: user
                });
            }                 
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios." });
        });    
}


/// 04. Listado de usuarios
const listUsers = (req, res) => {

    //Controlar en que pagina estamos y cuantos elementos por pagina mostrará
    let pagina= 1;
    let usersPorPagina= 1000;

    if(req.params.pagina){
        pagina= parseInt(req.params.pagina);
    }
    if(req.params.usersPorPagina){
        usersPorPagina= parseInt(req.params.usersPorPagina);
    }

    //Consulta con mongoose paginate
    User.find().sort('_id').paginate(pagina, usersPorPagina, (error, users, total) =>{
        
        if (error) return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios." });

        if (!users) return res.status(404).json({ status: "error", message: "No hay usuarios" });


        // Devolver resultado
        return res.status(200).send({
        status: "succes",
        message: "Usuario encontrado satisfactoriamente",
        pagina: pagina,
        usersPorPagina: usersPorPagina,
        total_Paginas: Math.ceil(total/usersPorPagina),
        total_Usuarios: total,
        usuarios: users

        });

    })
}


/// 05. Editar usuario
const update = (req, res) =>{

    //Recoger info del usuario a actualizar y el logueado
    let userToUpdate=req.body;
    const userLogueado= req.user;
    
    //Comprobar que llegue el paramentro id, correo y dni a updatear 
    if(!userToUpdate.id || !userToUpdate.dni || !userToUpdate.email){
        return res.status(400).send({
            status:"error",
            message: "Faltan por enviar el 'id', 'email' o 'dni' del user a actualizar por el 'Body'",
            
        });
    }

    //Comprobar que el usuario sea Admin (role:1) o el mismo user que se quiere editar a el mismo
    let role_logueado= userLogueado.role;
    let id_logueado= userLogueado.id;

    const id_userToUpdate = userToUpdate.id;
   
    console.log("idUser:"+ id_userToUpdate +"  id_logueado:"+ id_logueado);

    if(id_userToUpdate != id_logueado && role_logueado!= 1){
        return res.status(401).send({
            status:"error",
            message: "Debe de estar logueado con un TOKEN de usuario igual al que va a editar, o con rol de Admin (1)",
            
        });

    }
    /* 
    INTERESANTE: esta consulta aunque venga vacia (porque por ejemplo editemos el dni y email y no coincida con ningun)
        dejará vacio el 'users', pero igualmente se ejecutara el .them() aunquie haya 0 registros, a no ser que de error.
    */ 
    User.find({
        $or: [
            { email: userToUpdate.email }
            ,{ dni: userToUpdate.dni },
        ]
    }).then(async (users) => {

        // Comprobar si el DNI o email ya lo tiene cogido otro usuario (duplicate)
        let paramDuplicate = false;

        users.forEach(user => {
            if(user && user._id != id_userToUpdate) paramDuplicate= true;
        });

        if (paramDuplicate) {
            //Ya existe otro usuario con este correo o DNI
            return res.status(200).send({
                status: "duplicate",
                message: "Ya existe otro usuario con este correo o DNI"
            })
        } else {
            //Si no existe duplicado ,se crea el usuario
            // Cifrar contraseña
            if(userToUpdate.password){
                let pwd = await bcrypt.hash(userToUpdate.password.toLowerCase(), 10);
                userToUpdate.password = pwd;
            }
            
            //Buscar y actualizar
            User.findByIdAndUpdate(userToUpdate.id, userToUpdate, {new:true})
                .then(async (userUpdated) => {
                    return res.status(200).send({ 
                        status:"success",
                        message: "Usuario actualizado correctamente",
                        userUpdated: userUpdated
                    })

                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({ status: "error", message: "Error en el update del usuario. Compruebe el id introducido." });
                });
                


        }
    }).catch((err) => {

        console.log(err);
        return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios." });
    });

}



/// 06. Subir imagen avatar
const uploadAvatar = (req, res)=> {

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

    } else if( req.file.size > 5500000){
        // SI el archivo pesa mas de 5MB lo borra
        const filePath = req.file.path; //Ruta donde segurarda el archivo

        fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "error",
            message: "El archivo pesa mas de 5MB, sube un archivo menos pesado"
        })

    } else{
        // Si es correcto, actualizar en la BBDD
        User.findOneAndUpdate({id: req.user.id}, {avatar: req.file.filename}, {new:true}, (error, userUpdated) =>{

            console.log(error);
            if(error || !userUpdated){
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida del avatar"
                })
            }

            //Devolver respuesta
            return res.status(200).send({
            status: "success",
            userUpdated: userUpdated,
            file: req.file
            });
        })
      
    }   
   
}







// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login, 
    getUser,
    listUsers,
    update,
    uploadAvatar
}