import express from "express";
import clientesRoutes from "./routes/clientes.routes.js";
//import conceptosRoutes from "./routes/conceptos.routes.js";
//import reglasRoutes from "./routes/reglas.routes.js";
//import vencimientosRoutes from "./routes/vencimientos.routes.js";
//import bolsasRoutes from "./routes/bolsas.routes.js";
//import usosRoutes from "./routes/usoPuntos.routes.js";
import morgan from 'morgan';


const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use("/clientes", clientesRoutes);
//app.use("/conceptos", conceptosRoutes);
//app.use("/reglas", reglasRoutes);
//app.use("/vencimientos", vencimientosRoutes);
//app.use("/bolsas", bolsasRoutes);
//app.use("/usos", usosRoutes);

app.listen(3000, () => console.log("Servidor en puerto 3000"));