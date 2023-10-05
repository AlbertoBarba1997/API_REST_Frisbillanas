const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");

//Definir rutas
router.get("/prueba_publication", PublicationController.pruebaPublication);

//Exportar router
module.exports = router;