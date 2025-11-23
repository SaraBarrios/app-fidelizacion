import {
  getAllBolsas,
  getBolsa,
  createNewBolsa,
  updateBolsaById,
  deleteBolsaById
} from "../services/bolsas.service.js";

export const getBolsas = async (req, res) => {
  try {
    const bolsas = await getAllBolsas();
    res.json(bolsas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener bolsas" });
  }
};

export const getBolsaById = async (req, res) => {
  try {
    const bolsa = await getBolsa(req.params.id);

    if (!bolsa) {
      return res.status(404).json({ error: "Bolsa no encontrada" });
    }

    res.json(bolsa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener bolsa" });
  }
};

export const createBolsa = async (req, res) => {
  try {
    const bolsa = await createNewBolsa(req.body);

    res.status(201).json({
      mensaje: "Bolsa creada correctamente",
      bolsa,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear bolsa" });
  }
};

export const updateBolsa = async (req, res) => {
  try {
    const { rowCount, rows } = await updateBolsaById(req.params.id, req.body);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Bolsa no encontrada" });
    }

    res.json({
      mensaje: "Bolsa actualizada correctamente",
      bolsa: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar bolsa" });
  }
};

export const deleteBolsa = async (req, res) => {
  try {
    const { rowCount, rows } = await deleteBolsaById(req.params.id);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Bolsa no encontrada" });
    }

    res.json({
      mensaje: "Bolsa eliminada correctamente",
      bolsa: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar bolsa" });
  }
};
