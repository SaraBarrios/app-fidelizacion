import * as usoPuntosService from "../services/usoPuntos.service.js";

export const getUsoPuntos = async (req, res) => {
  try {
    const usos = await usoPuntosService.getAllUsoPuntos();
    res.json(usos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsoPuntoById = async (req, res) => {
  try {
    const { id } = req.params;
    const uso = await usoPuntosService.getUsoPuntoById(id);
    if (!uso) return res.status(404).json({ message: "Uso de puntos no encontrado" });
    res.json(uso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST con lógica FIFO
export const createUsoPunto = async (req, res) => {
  try {
    const { cliente_id, puntaje_utilizado, fecha, concepto_id } = req.body;
    const nuevoUso = await usoPuntosService.createUsoPunto({
      cliente_id,
      puntaje_utilizado,
      fecha,
      concepto_id
    });
    res.status(201).json(nuevoUso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUsoPunto = async (req, res) => {
  try {
    const { id } = req.params;
    const { puntaje_utilizado, fecha, concepto_id } = req.body;
    const updatedUso = await usoPuntosService.updateUsoPunto(id, { puntaje_utilizado, fecha, concepto_id });
    if (!updatedUso) return res.status(404).json({ message: "Uso de puntos no encontrado" });
    res.json(updatedUso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUsoPunto = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUso = await usoPuntosService.deleteUsoPunto(id);
    if (!deletedUso) return res.status(404).json({ message: "Uso de puntos no encontrado" });
    res.json({ message: "Uso de puntos eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
