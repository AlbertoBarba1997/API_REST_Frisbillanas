const express = require("express");
const router = express.Router();
const ParticipationController = require("../controllers/participation");

//Definir rutas
router.get("/prueba-participation", ParticipationController.pruebaParticipation);

//Exportar router
module.exports = router;