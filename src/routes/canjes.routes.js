import { Router } from "express";
import { realizarCanje } from "../controllers/canjes.controller.js";

const router = Router();
router.post("/", realizarCanje);

export default router;