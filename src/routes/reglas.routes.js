import { Router } from "express";
import {
  getReglasController,
  getReglaByIdController,
  createReglaController,
  updateReglaController,
  deleteReglaController
} from "../controllers/reglas.controller.js";

const router = Router();

// Ruta para traer todas las reglas
// GET /reglas
router.get("/", getReglasController);

//Ruta para traer una regla por ID
// GET /reglas/:id
router.get("/:id", getReglaByIdController);

// Ruta para crear una nueva regla
// POST /reglas
router.post("/", createReglaController);

//  Ruta para actualizar una regla por ID
// PUT /reglas/:id
router.put("/:id", updateReglaController);

// Ruta para eliminar una regla por ID
// DELETE /reglas/:id
router.delete("/:id", deleteReglaController);

export default router;