import { Router } from "express";
import {
  getVencimientos,
  getVencimientoById,
  createVencimiento,
  updateVencimiento,
  deleteVencimiento
} from "../controllers/vencimientos.controller.js";

const router = Router();

router.get("/", getVencimientos);
router.get("/:id", getVencimientoById);
router.post("/", createVencimiento);
router.put("/:id", updateVencimiento);
router.delete("/:id", deleteVencimiento);

export default router;
