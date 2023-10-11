const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const multer = require("multer");
const auth = require ("../middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname.toLocaleLowerCase());
    }    
});

const uploads = multer({storage});


//Definir rutas
router.get("/login", UserController.login);                        //Es necesario logear para hacer la gran mayoria de peticiones restantes, que requeriran del token en el mdlw de auth.

router.get("/prueba_user", auth.auth, UserController.pruebaUser);
router.post("/alta", auth.auth, UserController.register);
router.get("/getUser/:id", auth.auth, UserController.getUser);
router.get("/listUsers/:usersPorPagina?/:pagina?/", auth.auth, UserController.listUsers);
router.put("/update", auth.auth, UserController.update);
router.post("/uploadAvatar", [auth.auth, uploads.single("file0")], UserController.uploadAvatar);
router.get("/getAvatar/:file", auth.auth, UserController.getAvatar);
router.delete("/baja/:id", auth.auth, UserController.remove);


//Exportar router
module.exports = router;


