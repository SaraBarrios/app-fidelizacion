import { Router } from "express";
import { getBolsas, getBolsaById, createBolsa, updateBolsa, deleteBolsa } from "../controllers/bolsas.controller.js";

const router = Router();

router.get("/", getBolsas);
router.get("/:id", getBolsaById);
router.post("/", createBolsa);
router.put("/:id", updateBolsa);
router.delete("/:id", deleteBolsa);

export default router;
