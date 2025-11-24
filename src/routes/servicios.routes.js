import { Router } from "express";
import { cargarPuntos, utilizarPuntos, convertirMonto } from "../controllers/servicios.controller.js";

const router = Router();
router.post("/cargarPuntos", cargarPuntos);
router.post("/utilizarPuntos", utilizarPuntos);
router.get("/convertirMonto", convertirMonto);

export default router;
