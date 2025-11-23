import { Router } from "express";
import { getUsoPuntos, getUsoPuntoById, createUsoPunto, updateUsoPunto, deleteUsoPunto } from "../controllers/usoPuntos.controller.js";

const router = Router();

router.get("/", getUsoPuntos);
router.get("/:id", getUsoPuntoById);
router.post("/", createUsoPunto);      
router.put("/:id", updateUsoPunto);
router.delete("/:id", deleteUsoPunto);

export default router;
