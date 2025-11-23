import { pool } from "../db/connection.js";

export const getAllUsoPuntos = async () => {
  const result = await pool.query("SELECT * FROM uso_puntos ORDER BY id DESC");
  return result.rows;
};

export const getUsoPuntoById = async (id) => {
  const result = await pool.query("SELECT * FROM uso_puntos WHERE id = $1", [id]);
  return result.rows[0];
};

export const createUsoPunto = async ({ cliente_id, puntaje_utilizado, fecha, concepto_id }) => {
  const result = await pool.query(
    `INSERT INTO uso_puntos (cliente_id, puntaje_utilizado, fecha, concepto_id) 
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [cliente_id, puntaje_utilizado, fecha, concepto_id]
  );
  return result.rows[0];
};

export const updateUsoPunto = async (id, { puntaje_utilizado, fecha, concepto_id }) => {
  const result = await pool.query(
    `UPDATE uso_puntos 
     SET puntaje_utilizado=$1, fecha=$2, concepto_id=$3 
     WHERE id=$4 RETURNING *`,
    [puntaje_utilizado, fecha, concepto_id, id]
  );
  return result.rows[0];
};

export const deleteUsoPunto = async (id) => {
  const result = await pool.query("DELETE FROM uso_puntos WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
};
