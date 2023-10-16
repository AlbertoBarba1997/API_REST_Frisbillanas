// Index.js - Carga todo lo que nuestra aplicación va a tener //
// El proyecto lo vamos a arrancar de manera mas sencilla en un solo paso, ejecutanto el script arrancar_proyecto.bat 
console.log("Aplicacacion Servidor de Frisbillanas arrancada! ");


//Importar dependencias
const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");


// Conexion a la BBDD
connection();

// Crear servidor node
const app = express();
const puerto = 4200;

// Configurar cors
app.use(cors());

// Convertir los datos del bodi a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const TournamentRoutes = require("./routes/tournament");
const ParticipationRoutes = require("./routes/participation");

app.use("/api/usuarios", UserRoutes);
app.use("/api/publicaciones", PublicationRoutes);
app.use("/api/torneos", TournamentRoutes );
app.use("/api/participaciones", ParticipationRoutes );

// (Ruta de prueba)
app.get("/ruta-prueba" , (req, res)=>{
    return res.status(200).json({
        id: 1,
        nombre : "alberto",
        apellidos : "barba"
    })
})

//Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto);
})