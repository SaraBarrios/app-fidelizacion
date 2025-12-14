
import {
  getAllClientes,
  getCliente,
  deleteClienteById,
  createNewCliente,
  updateClienteById,
  segmentarClientesService
} from "../services/clientes.service.js";
import { obtenerPromocionesParaClienteService } from "../services/promociones.service.js";


export const getClientes = async (req, res) => {
  try {
    const clientes = await getAllClientes();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const cliente = await getCliente(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const { rowCount, rows } = await deleteClienteById(req.params.id);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({
      mensaje: "Cliente eliminado correctamente",
      cliente: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};

export const createCliente = async (req, res) => {
  try {
    const cliente = await createNewCliente(req.body);

    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const updateCliente = async (req, res) => {
  try {
    const result = await updateClienteById(req.params.id, req.body);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({
      mensaje: "Cliente actualizado correctamente",
      cliente: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};


// Funcionalidad para Final
export const segmentarClientesController = async (req, res) => {
  try {
    const filtros = req.query; // edad_min, ciudad, nacionalidad, etc.
    const resultado = await segmentarClientesService(filtros);

    return res.json({
      success: true,
      cantidad: resultado.length,
      clientes: resultado,
    });
  } catch (error) {
    console.error("Error en segmentación:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al segmentar clientes",
    });
  }
};

// PROMOCIONES PERSONALIZADAS PARA UN CLIENTE
export const promocionesClienteController = async (req, res) => {
  try {
    const { id } = req.params;

    const promociones = await obtenerPromocionesParaClienteService(id);

    return res.json({
      success: true,
      cantidad: promociones.length,
      promociones,
    });

  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al obtener promociones del cliente",
    });
  }
};
