import { Router } from "express";
import {
  crearPromocion,
  getPromociones,
  updatePromocion,
  deletePromocion,
} from "../controllers/promociones.controller.js";

const router = Router();

router.post("/promociones", crearPromocion);
router.get("/promociones", getPromociones);
router.put("/promociones/:id", updatePromocion);
router.delete("/promociones/:id", deletePromocion);

export default router;
