import { pool } from "../db/connection.js";

export const getUsoPuntosReporte = async ({ cliente_id, concepto_id, fecha_inicio, fecha_fin }) => {
  let query = `
    SELECT up.id as uso_id, up.cliente_id, up.puntaje_utilizado, up.fecha, up.concepto_id,
           upd.id as detalle_id, upd.bolsa_id, upd.puntaje_utilizado as puntaje_detalle
    FROM uso_puntos up
    LEFT JOIN uso_puntos_detalle upd ON up.id = upd.uso_id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (cliente_id) { query += ` AND up.cliente_id=$${idx++}`; params.push(cliente_id); }
  if (concepto_id) { query += ` AND up.concepto_id=$${idx++}`; params.push(concepto_id); }
  if (fecha_inicio) { query += ` AND up.fecha >= $${idx++}`; params.push(fecha_inicio); }
  if (fecha_fin) { query += ` AND up.fecha <= $${idx++}`; params.push(fecha_fin); }

  query += " ORDER BY up.id DESC, upd.id ASC";

  const result = await pool.query(query, params);
  return result.rows;
};

export const getBolsaPuntosReporte = async ({ cliente_id, saldo_min, saldo_max }) => {
  let query = "SELECT * FROM bolsa_puntos WHERE 1=1";
  const params = [];
  let idx = 1;

  if (cliente_id) { query += ` AND cliente_id=$${idx++}`; params.push(cliente_id); }
  if (saldo_min) { query += ` AND saldo_puntos >= $${idx++}`; params.push(saldo_min); }
  if (saldo_max) { query += ` AND saldo_puntos <= $${idx++}`; params.push(saldo_max); }

  query += " ORDER BY id DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

export const getClientesPuntosVencer = async (dias) => {
  const query = `
    SELECT * 
    FROM bolsa_puntos
    WHERE fecha_caducidad <= NOW() + INTERVAL '${dias} days'
      AND saldo_puntos > 0
    ORDER BY fecha_caducidad ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getClientesFiltrados = async ({ nombre, apellido, cumple }) => {
  let query = "SELECT * FROM clientes WHERE 1=1";
  const params = [];
  let idx = 1;

  if (nombre) { query += ` AND nombre ILIKE $${idx++}`; params.push(`%${nombre}%`); }
  if (apellido) { query += ` AND apellido ILIKE $${idx++}`; params.push(`%${apellido}%`); }
  if (cumple) {
    query += ` AND TO_CHAR(fecha_nacimiento,'MM-DD') = TO_CHAR($${idx++}::date,'MM-DD')`;
    params.push(cumple);
  }

  query += " ORDER BY id";

  const result = await pool.query(query, params);
  return result.rows;
};
