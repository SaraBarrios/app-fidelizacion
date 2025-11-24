import * as reportesService from "../services/reportes.service.js";


export const getUsoPuntosReporte = async (req, res) => {
  try {
    const { cliente_id, concepto_id, fecha_inicio, fecha_fin } = req.query;
    const data = await reportesService.getUsoPuntosReporte({ cliente_id, concepto_id, fecha_inicio, fecha_fin });

    // Agrupar por uso_id para devolver cabecera con detalle
    const usosMap = {};
    data.forEach(row => {
      if (!usosMap[row.uso_id]) {
        usosMap[row.uso_id] = {
          uso_id: row.uso_id,
          cliente_id: row.cliente_id,
          puntaje_utilizado: row.puntaje_utilizado,
          fecha: row.fecha,
          concepto_id: row.concepto_id,
          detalle: []
        };
      }
      if (row.detalle_id) {
        usosMap[row.uso_id].detalle.push({
          detalle_id: row.detalle_id,
          bolsa_id: row.bolsa_id,
          puntaje_utilizado: row.puntaje_detalle
        });
      }
    });

    res.json(Object.values(usosMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBolsaPuntosReporte = async (req, res) => {
  try {
    const { cliente_id, saldo_min, saldo_max } = req.query;
    const data = await reportesService.getBolsaPuntosReporte({ cliente_id, saldo_min, saldo_max });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientesPuntosVencer = async (req, res) => {
  try {
    const { dias } = req.query;
    if (!dias) return res.status(400).json({ message: "Debes enviar los días" });

    const data = await reportesService.getClientesPuntosVencer(dias);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientesBusqueda = async (req, res) => {
  try {
    const { nombre, apellido, cumple } = req.query;
    const data = await reportesService.getClientesFiltrados({ nombre, apellido, cumple });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
