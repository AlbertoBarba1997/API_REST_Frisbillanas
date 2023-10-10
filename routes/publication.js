const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const multer = require("multer");
const auth = require ("../middlewares/auth");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, "publication-"+Date.now()+"-"+file.originalname);
    }    
});

const uploads = multer({storage});


//Definir rutas

 router.post("/alta", auth.auth, PublicationController.create);
 router.get("/getPublication/:id", PublicationController.getPublication);
 router.get("/listPublications/:publicationsPorPagina?/:pagina?",PublicationController.listPublications );
// router.post("/uploadAvatar", [auth.auth, uploads.single("file0")], UserController.uploadAvatar);
// router.get("/getAvatar/:file", auth.auth, UserController.getAvatar);
 router.delete("/baja/:id", auth.auth, PublicationController.remove);


//Exportar router
module.exports = router;