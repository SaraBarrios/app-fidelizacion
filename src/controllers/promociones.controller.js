import {
  crearPromocionService,
  getPromocionesService,
  updatePromocionService,
  deletePromocionService,
} from "../services/promociones.service.js";

// POST
export const crearPromocion = async (req, res) => {
  try {
    const promo = await crearPromocionService(req.body);
    res.status(201).json({ success: true, promocion: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET
export const getPromociones = async (req, res) => {
  try {
    const promos = await getPromocionesService();
    res.json({ success: true, promociones: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT
export const updatePromocion = async (req, res) => {
  try {
    const promo = await updatePromocionService(req.params.id, req.body);
    res.json({ success: true, promocion: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deletePromocion = async (req, res) => {
  try {
    await deletePromocionService(req.params.id);
    res.json({ success: true, message: "Promoción eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
