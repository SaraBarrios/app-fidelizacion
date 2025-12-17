import { canjearPuntos } from "../services/canjes.service.js";

export const realizarCanje = async (req, res) => {
  try {
    const { cliente_id, concepto_id } = req.body;
    const data = await canjearPuntos({ cliente_id, concepto_id });
    res.status(201).json({ mensaje: "Canje realizado correctamente", data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}