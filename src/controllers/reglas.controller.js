import {
  getReglas,
  getReglaById,
  createRegla,
  updateRegla,
  deleteRegla,
  existeReglaGlobal,
  existeSuperposicion
} from "../services/reglas.service.js";

// GET /reglas -> obtener todas las reglas
export const getReglasController = async (req, res) => {
  try {
    const reglas = await getReglas();
    res.json(reglas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las reglas" });
  }
};

// GET /reglas/:id -> obtener regla por ID
export const getReglaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const regla = await getReglaById(id);
    if (!regla) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }
    res.json(regla);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la regla" });
  }
};

// POST /reglas -> crear nueva regla
export const createReglaController = async (req, res) => {
  try {
    const { limite_inferior, limite_superior, equivalencia } = req.body;


    if (!equivalencia || equivalencia <= 0) {
      return res.status(400).json({ error: "La equivalencia debe ser mayor a cero" });
    }

    const tieneInferior = limite_inferior !== undefined;
    const tieneSuperior = limite_superior !== undefined;

    if (tieneInferior !== tieneSuperior) {
      return res.status(400).json({ error: "Debe enviar ambos límites o ninguno" });
    }

    if (tieneInferior && tieneSuperior) {
      if (limite_inferior < 0 || limite_superior <= limite_inferior) {
        return res.status(400).json({ error: "El límite superior debe ser mayor que el límite inferior" });
      }

      const superposicion = await existeSuperposicion(limite_inferior, limite_superior);
      if (superposicion) {
        return res.status(400).json({ error: "La regla se superpone con otra existente" });
      }
    } else {
      const existeGlobal = await existeReglaGlobal();
      if (existeGlobal) {
        return res.status(400).json({ error: "Ya existe una regla global (sin límites)" });
      }
    }

    const nuevaRegla = await createRegla({
      limite_inferior: tieneInferior ? limite_inferior : null,
      limite_superior: tieneSuperior ? limite_superior : null,
      equivalencia
    });

    res.status(201).json(nuevaRegla);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear regla" });
  }
};

// PUT /reglas/:id -> actualizar regla
export const updateReglaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { limite_inferior, limite_superior, equivalencia } = req.body;


    if (!equivalencia || equivalencia <= 0) {
      return res.status(400).json({ error: "La equivalencia debe ser mayor a cero" });
    }

    const tieneInferior = limite_inferior !== undefined;
    const tieneSuperior = limite_superior !== undefined;

    if (tieneInferior !== tieneSuperior) {
      return res.status(400).json({ error: "Debe enviar ambos límites o ninguno" });
    }

    if (tieneInferior && tieneSuperior) {
      if (limite_inferior < 0 || limite_superior <= limite_inferior) {
        return res.status(400).json({ error: "El límite superior debe ser mayor que el límite inferior" });
      }

      const superposicion = await existeSuperposicion(limite_inferior, limite_superior, id);
      if (superposicion) {
        return res.status(400).json({ error: "La regla se superpone con otra existente" });
      }
    }

    const result = await updateRegla(id, {
      limite_inferior: tieneInferior ? limite_inferior : null,
      limite_superior: tieneSuperior ? limite_superior : null,
      equivalencia
    });

    const { rowCount, rows } = result;
    if (rowCount === 0) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    res.json({ mensaje: "Regla actualizada correctamente", regla: rows[0] });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la regla" });
  }
};

// DELETE /reglas/:id -> eliminar regla
export const deleteReglaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount, rows } = await deleteRegla(id);


    if (rowCount === 0) {
      return res.status(404).json({ error: "Regla no encontrada" });
    }

    res.json({ mensaje: "Regla eliminada correctamente", regla: rows[0] });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la regla" });
  }
};
