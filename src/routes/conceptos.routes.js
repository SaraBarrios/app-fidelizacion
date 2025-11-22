import { Router } from "express";
import {
  getConceptosController,
  getConceptoByIdController,
  createConceptoController,
  updateConceptoController,
  deleteConceptoController
} from "../controllers/conceptos.controller.js";

const router = Router();

// GET /conceptos -> todos los conceptos
router.get("/", getConceptosController);

// GET /conceptos/:id -> un concepto por id
router.get("/:id", getConceptoByIdController);

// POST /conceptos -> crear concepto
router.post("/", createConceptoController);

// PUT /conceptos/:id -> actualizar concepto
router.put("/:id", updateConceptoController);

// DELETE /conceptos/:id -> eliminar concepto
router.delete("/:id", deleteConceptoController);

export default router;