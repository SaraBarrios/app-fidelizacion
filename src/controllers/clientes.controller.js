
import {
  getAllClientes,
  getCliente,
  deleteClienteById,
  createNewCliente,
  updateClienteById
} from "../services/clientes.service.js";

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
    const { rowCount, rows } = await updateClienteById(req.params.id, req.body);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({
      mensaje: "Cliente actualizado correctamente",
      cliente: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};
