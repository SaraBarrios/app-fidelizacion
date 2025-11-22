// importamos la conexión a la base de datos
import { pool } from "../db/connection.js";

// función para obtener todos los conceptos de puntos
export const getAllConceptos = async () => {
  // ejecutamos la consulta para traer todo de la tabla conceptos_puntos
  const result = await pool.query("SELECT * FROM conceptos_puntos");
  // devolvemos solo las filas que trajo la consulta
  return result.rows;
};

// función para obtener un concepto por su id
export const getConceptoById = async (id) => {
  // usamos $1 para evitar SQL injection, y le pasamos el id como valor
  const result = await pool.query(
    "SELECT * FROM conceptos_puntos WHERE id = $1",
    [id]
  );
  // devolvemos la primera fila, porque solo debe haber un concepto con ese id
  return result.rows[0];
};

// función para crear un nuevo concepto
export const createConcepto = async (data) => {
  const { descripcion, puntos_requeridos } = data; // sacamos los datos que necesitamos

  // query para insertar un nuevo concepto en la base de datos
  const query = `
    INSERT INTO conceptos_puntos (descripcion, puntos_requeridos)
    VALUES ($1, $2)
    RETURNING *;
  `;


  const values = [descripcion, puntos_requeridos]; // valores que reemplazan $1 y $2
  const result = await pool.query(query, values);

  // devolvemos la fila recién insertada
  return result.rows[0];
};

// función para actualizar un concepto existente
export const updateConcepto = async (id, data) => {
  const { descripcion, puntos_requeridos } = data; // datos nuevos que vamos a actualizar

  // query para actualizar el concepto
  const query = `
    UPDATE conceptos_puntos
    SET descripcion = $1,
        puntos_requeridos = $2
    WHERE id = $3
    RETURNING *; 
  `;

  const values = [descripcion, puntos_requeridos, id]; // valores para la query
  const result = await pool.query(query, values);

  // devolvemos el resultado completo, no solo la fila (se podría cambiar a result.rows[0])
  return result;
};

// función para eliminar un concepto
export const deleteConcepto = async (id) => {
  // query para borrar el concepto según su id
  const result = await pool.query(
    "DELETE FROM conceptos_puntos WHERE id = $1 RETURNING *", // devuelve el concepto eliminado
    [id]
  );
  return result; // devolvemos el resultado completo
};
