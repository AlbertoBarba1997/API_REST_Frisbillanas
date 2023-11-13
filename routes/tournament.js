const express = require("express");
const router = express.Router();
const TournamentController = require("../controllers/tournament");
const multer = require("multer");
const auth = require ("../middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/tournaments/")
    },
    filename: (req, file, cb) => {
        cb(null, "tournament-"+Date.now()+"-"+file.originalname.toLocaleLowerCase());
    }    
});

const uploads = multer({storage});


//Definir rutas

 router.post("/alta", auth.auth, TournamentController.create);
 router.delete("/baja/:id", auth.auth, TournamentController.remove);
 router.get("/getTournament/:id", auth.auth, TournamentController.getTournament);
 router.post("/listTournaments/:publicationsPorPagina?/:pagina?",TournamentController.listTournaments );
 router.post("/uploadImage/:id", [auth.auth, uploads.single("file0")], TournamentController.uploadImage);
 router.get("/getImage/:file", TournamentController.getImage);
 


//Exportar router
module.exports = router;