import { pool } from "../db/connection.js";

// Traer todas las reglas
export const getReglas = async () => {
  const result = await pool.query("SELECT * FROM reglas_puntos ORDER BY id");
  return result.rows;
};

// Traer una regla por ID
export const getReglaById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM reglas_puntos WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// Crear una nueva regla
export const createRegla = async (data) => {
  const { limite_inferior, limite_superior, equivalencia } = data;

  const query = `
    INSERT INTO reglas_puntos (limite_inferior, limite_superior, equivalencia)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    limite_inferior !== undefined ? limite_inferior : null,
    limite_superior !== undefined ? limite_superior : null,
    equivalencia
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Actualizar una regla por ID
export const updateRegla = async (id, data) => {
  const { limite_inferior, limite_superior, equivalencia } = data;

  const query = `
    UPDATE reglas_puntos
    SET 
      limite_inferior = $1,
      limite_superior = $2,
      equivalencia = $3
    WHERE id = $4
    RETURNING *;
  `;

  const values = [
    limite_inferior !== undefined ? limite_inferior : null,
    limite_superior !== undefined ? limite_superior : null,
    equivalencia,
    id
  ];

  const result = await pool.query(query, values);
  return result;
};

// Eliminar una regla por ID
export const deleteRegla = async (id) => {
  const result = await pool.query(
    "DELETE FROM reglas_puntos WHERE id = $1 RETURNING *",
    [id]
  );
  return result;
};

// Validar existencia de regla global (sin límites)
export const existeReglaGlobal = async () => {
  const result = await pool.query(
    "SELECT * FROM reglas_puntos WHERE limite_inferior IS NULL AND limite_superior IS NULL"
  );
  return result.rowCount > 0;
};

// Validar superposición de rangos
export const existeSuperposicion = async (limite_inferior, limite_superior, idActualizar = null) => {
  let query = `
    SELECT * FROM reglas_puntos
    WHERE limite_inferior <= $2 AND limite_superior >= $1
  `;
  const values = [limite_inferior, limite_superior];

  // Si se pasa un ID, excluimos esa regla de la búsqueda
  if (idActualizar) {
    query += ` AND id != $3`;
    values.push(idActualizar);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};