const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const auth = require ("../middlewares/auth");

//Definir rutas
router.get("/login", UserController.login);                        //Es necesario logear para hacer la gran mayoria de peticiones restantes, que requeriran del token en el mdlw de auth.

router.get("/prueba_user", auth.auth, UserController.pruebaUser);
router.post("/alta", auth.auth, UserController.register);
router.get("/getUser/:id", auth.auth, UserController.getUser);
router.get("/listUsers/:usersPorPagina?/:pagina?/", auth.auth, UserController.listUsers);
router.put("/update", auth.auth, UserController.update);



//Exportar router
module.exports = router;


