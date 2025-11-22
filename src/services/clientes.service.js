import { pool } from "../db/connection.js";

export const getAllClientes = async () => {
  const result = await pool.query("SELECT * FROM clientes");
  return result.rows;
};

export const getCliente = async (id) => {
  const result = await pool.query(
    "SELECT * FROM clientes WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const deleteClienteById = async (id) => {
  const result = await pool.query(
    "DELETE FROM clientes WHERE id = $1 RETURNING *",
    [id]
  );
  return result;
};

export const createNewCliente = async (data) => {
  const {
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento
  } = data;

  const query = `
    INSERT INTO clientes 
    (nombre, apellido, numero_documento, tipo_documento, nacionalidad, email, telefono, fecha_nacimiento)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateClienteById = async (id, data) => {
  const {
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento
  } = data;

  const query = `
    UPDATE clientes
    SET 
      nombre = $1,
      apellido = $2,
      numero_documento = $3,
      tipo_documento = $4,
      nacionalidad = $5,
      email = $6,
      telefono = $7,
      fecha_nacimiento = $8
    WHERE id = $9
    RETURNING *;
  `;

  const values = [
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento,
    id
  ];

  const result = await pool.query(query, values);
  return result;
};
