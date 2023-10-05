const express = require("express");
const router = express.Router();
const ContentController = require("../controllers/content");

//Definir rutas
router.get("/prueba_content", ContentController.pruebaContent);

//Exportar router
module.exports = router;