import { pool } from "../db/connection.js";

export const getAllBolsas = async () => {
  const result = await pool.query("SELECT * FROM bolsa_puntos ORDER BY id");
  return result.rows;
};

export const getBolsa = async (id) => {
  const result = await pool.query(
    "SELECT * FROM bolsa_puntos WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const createNewBolsa = async (data) => {
  const {
    cliente_id,
    fecha_asignacion,
    fecha_caducidad,
    puntaje_asignado,
    puntaje_utilizado = 0,
    saldo_puntos,
    monto_operacion
  } = data;

  const query = `
    INSERT INTO bolsa_puntos
    (cliente_id, fecha_asignacion, fecha_caducidad, puntaje_asignado, puntaje_utilizado, saldo_puntos, monto_operacion)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    cliente_id,
    fecha_asignacion,
    fecha_caducidad,
    puntaje_asignado,
    puntaje_utilizado,
    saldo_puntos,
    monto_operacion,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateBolsaById = async (id, data) => {
  const {
    cliente_id,
    fecha_asignacion,
    fecha_caducidad,
    puntaje_asignado,
    puntaje_utilizado,
    saldo_puntos,
    monto_operacion
  } = data;

  const query = `
    UPDATE bolsa_puntos
    SET
      cliente_id = $1,
      fecha_asignacion = $2,
      fecha_caducidad = $3,
      puntaje_asignado = $4,
      puntaje_utilizado = $5,
      saldo_puntos = $6,
      monto_operacion = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    cliente_id,
    fecha_asignacion,
    fecha_caducidad,
    puntaje_asignado,
    puntaje_utilizado,
    saldo_puntos,
    monto_operacion,
    id,
  ];

  const result = await pool.query(query, values);
  return result;
};

export const deleteBolsaById = async (id) => {
  const result = await pool.query(
    "DELETE FROM bolsa_puntos WHERE id = $1 RETURNING *",
    [id]
  );
  return result;
};
