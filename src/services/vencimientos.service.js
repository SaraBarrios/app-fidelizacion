import { pool } from "../db/connection.js";

// Obtener todos
export const getAllVencimientos = async () => {
  const query = "SELECT * FROM vencimientos_puntos ORDER BY id";
  const { rows } = await pool.query(query);
  return rows;
};

// Obtener por ID
export const getVencimientoById = async (id) => {
  const query = "SELECT * FROM vencimientos_puntos WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Crear nuevo
export const createVencimiento = async ({ fecha_inicio, fecha_fin, dias_duracion }) => {
  const query = `
    INSERT INTO vencimientos_puntos (fecha_inicio, fecha_fin, dias_duracion)
    VALUES ($1, $2, $3)
    RETURNING *`;
  const values = [fecha_inicio, fecha_fin, dias_duracion];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Actualizar
export const updateVencimiento = async (id, { fecha_inicio, fecha_fin, dias_duracion }) => {
  const query = `
    UPDATE vencimientos_puntos
    SET fecha_inicio = $1,
        fecha_fin = $2,
        dias_duracion = $3
    WHERE id = $4
    RETURNING *`;

  const values = [fecha_inicio, fecha_fin, dias_duracion, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Eliminar
export const deleteVencimiento = async (id) => {
  const query = "DELETE FROM vencimientos_puntos WHERE id = $1 RETURNING id";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
