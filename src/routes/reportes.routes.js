import { Router } from "express";
import { getUsoPuntosReporte, getBolsaPuntosReporte, getClientesPuntosVencer, getClientesBusqueda } from "../controllers/reportes.controller.js";

const router = Router();
router.get("/usoPuntosReporte", getUsoPuntosReporte);
router.get("/bolsaPuntosReporte", getBolsaPuntosReporte);
router.get("/clientesPuntosVencer", getClientesPuntosVencer);
router.get("/clientesBusqueda", getClientesBusqueda);


export default router;
