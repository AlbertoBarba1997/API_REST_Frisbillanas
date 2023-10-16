//Importar Dependencias y módulos
const express = require("express");
const router = express.Router();
const ParticipationController = require("../controllers/participation");
const auth = require ("../middlewares/auth");



//Definir rutas
 router.post("/alta", auth.auth, ParticipationController.create);
 router.delete("/baja/:id", auth.auth, ParticipationController.remove);
 router.get("/listUsersTournament/:idTournament",  ParticipationController.listUsersTournament );
 router.get("/listTournamentsUser/:idUser", auth.auth, ParticipationController.listTournamentsUser );
 


//Exportar router
module.exports = router;