const express = require("express");
const router = express.Router();
const TournamentController = require("../controllers/tournament");

//Definir rutas
router.get("/prueba_tournament", TournamentController.pruebaTournament);

//Exportar router
module.exports = router;