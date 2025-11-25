import * as serviciosService from "../services/servicios.service.js";

export const cargarPuntos = async (req, res) => {
  try {
    const { cliente_id, monto_operacion} = req.body;
    const bolsa = await serviciosService.cargarPuntos({ cliente_id, monto_operacion});
    res.status(201).json(bolsa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const utilizarPuntos = async (req, res) => {
  try {
    const { cliente_id, concepto_id,} = req.body;
    const uso = await serviciosService.utilizarPuntos({ cliente_id, concepto_id});
    res.status(201).json(uso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const convertirMonto = async (req, res) => {
  try {
    const monto = Number(req.query.monto);
    if (isNaN(monto)) return res.status(400).json({ message: "monto inválido" });
    const puntos = await serviciosService.convertirMontoAPuntos(monto);
    res.json({ monto, puntos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
