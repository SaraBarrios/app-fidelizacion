import * as vencimientosService from "../services/vencimientos.service.js";

export const getVencimientos = async (req, res) => {
  try {
    const datos = await vencimientosService.getAllVencimientos();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVencimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const dato = await vencimientosService.getVencimientoById(id);
    if (!dato) return res.status(404).json({ message: "Vencimiento no encontrado" });
    res.json(dato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVencimiento = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, dias_duracion } = req.body;
    const nuevo = await vencimientosService.createVencimiento({
      fecha_inicio,
      fecha_fin,
      dias_duracion
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVencimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, dias_duracion } = req.body;
    const actualizado = await vencimientosService.updateVencimiento(id, {
      fecha_inicio,
      fecha_fin,
      dias_duracion
    });
    if (!actualizado) return res.status(404).json({ message: "Vencimiento no encontrado" });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVencimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await vencimientosService.deleteVencimiento(id);
    if (!eliminado) return res.status(404).json({ message: "Vencimiento no encontrado" });

    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
