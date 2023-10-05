const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");

//Definir rutas
router.get("/prueba_user", UserController.pruebaUser);
router.post("/alta", UserController.register);

//Exportar router
module.exports = router;