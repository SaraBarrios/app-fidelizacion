// importamos las funciones del modelo
import {
  getAllConceptos,
  getConceptoById,
  createConcepto,
  updateConcepto,
  deleteConcepto
} from "../services/conceptos.service.js";

// controller para traer todos los conceptos
export const getConceptosController = async (req, res) => {
  try {
    const conceptos = await getAllConceptos();
    res.json(conceptos); // devolvemos en formato JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los conceptos" });
  }
};

// controller para traer un concepto por id
export const getConceptoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const concepto = await getConceptoById(id);
    if (!concepto) {
      return res.status(404).json({ message: "Concepto no encontrado" });
    }
    res.json(concepto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el concepto" });
  }
};

// controller para crear un nuevo concepto
export const createConceptoController = async (req, res) => {
  try {
    const nuevoConcepto = await createConcepto(req.body);
    res.status(201).json(nuevoConcepto); // 201 = creado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el concepto" });
  }
};

// controller para actualizar un concepto
export const updateConceptoController = async (req, res) => {
  try {
    const { id } = req.params;
    const conceptoActualizado = await updateConcepto(id, req.body);
    res.json(conceptoActualizado.rows[0]); // devolvemos solo la fila actualizada
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el concepto" });
  }
};

// controller para eliminar un concepto
export const deleteConceptoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount, rows } = await deleteConcepto(id);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Concepto no encontrado" });
    }

    res.json({
      mensaje: "Concepto eliminado correctamente",
      concepto: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el concepto" });
  }
};