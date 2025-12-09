import { Router } from "express";
import {getClientes, getClienteById, deleteCliente, createCliente, updateCliente, segmentarClientesController,
  promocionesClienteController,} 
from "../controllers/clientes.controller.js";

const router = Router();

//nuevo para final
router.get("/segmentacion", segmentarClientesController);
router.get("/:id/promociones", promocionesClienteController);

router.get("/", getClientes);
router.get("/:id", getClienteById);
router.delete("/:id", deleteCliente);
router.post("/", createCliente);
router.put("/:id", updateCliente);

export default router;