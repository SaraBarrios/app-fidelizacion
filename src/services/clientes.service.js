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
    fecha_nacimiento,
    ciudad,
    nivel // puede venir o usar default 'BASICO'
  } = data;

  const query = `
    INSERT INTO clientes 
    (nombre, apellido, numero_documento, tipo_documento, nacionalidad, email, telefono, fecha_nacimiento, ciudad, nivel)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'BASICO'))
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
    ciudad,
    nivel
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
    fecha_nacimiento,
    ciudad,
    nivel
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
      fecha_nacimiento = $8,
      ciudad = $9,
      nivel = COALESCE($10, nivel)
    WHERE id = $11
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
    ciudad,
    nivel,
    id  
  ];

  const result = await pool.query(query, values);
  return result;
};

//Para final
export const segmentarClientesService = async (filtros) => {
  const {
    edad_min,
    edad_max,
    ciudad,
    nacionalidad,
    puntos_min,
    puntos_max,
    nivel,
  } = filtros;

  let query = `
    SELECT 
      c.*,
      EXTRACT(YEAR FROM AGE(c.fecha_nacimiento)) AS edad,
      COALESCE(SUM(b.saldo_puntos),0) AS puntos_actuales
    FROM clientes c
    LEFT JOIN bolsa_puntos b ON c.id = b.cliente_id
    WHERE 1=1
  `;

  const params = [];
  let idx = 1;

  if (edad_min) {
    query += ` AND EXTRACT(YEAR FROM AGE(c.fecha_nacimiento)) >= $${idx++}`;
    params.push(edad_min);
  }

  if (edad_max) {
    query += ` AND EXTRACT(YEAR FROM AGE(c.fecha_nacimiento)) <= $${idx++}`;
    params.push(edad_max);
  }

  if (ciudad) {
    query += ` AND c.ciudad = $${idx++}`;
    params.push(ciudad);
  }

  if (nacionalidad) {
    query += ` AND c.nacionalidad = $${idx++}`;
    params.push(nacionalidad);
  }

  if (puntos_min) {
    query += ` AND (SELECT COALESCE(SUM(b2.saldo_puntos),0) 
                    FROM bolsa_puntos b2 WHERE b2.cliente_id=c.id) >= $${idx++}`;
    params.push(puntos_min);
  }

  if (puntos_max) {
    query += ` AND (SELECT COALESCE(SUM(b2.saldo_puntos),0) 
                    FROM bolsa_puntos b2 WHERE b2.cliente_id=c.id) <= $${idx++}`;
    params.push(puntos_max);
  }

  if (nivel) {
    query += ` AND c.nivel = $${idx++}`;
    params.push(nivel);
  }

  query += " GROUP BY c.id";

  const result = await pool.query(query, params);
  return result.rows;
};

export const actualizarNivelCliente = async (cliente_id, puntos_adicionales) => {
  // 1. Obtener puntos actuales
  const res = await pool.query(
    "SELECT puntos_totales FROM clientes WHERE id=$1",
    [cliente_id]
  );

  const total = res.rows[0].puntos_totales + puntos_adicionales;

  // 2. Calcular nivel desde la BD
  const nivelRes = await pool.query(
    `
    SELECT nombre
    FROM niveles_fidelizacion
    WHERE puntos_min <= $1
      AND (puntos_max IS NULL OR puntos_max >= $1)
    LIMIT 1
    `,
    [total]
  );

  const nivel = nivelRes.rows[0].nombre;

  // 3. Actualizar cliente
  await pool.query(
    "UPDATE clientes SET puntos_totales=$1, nivel=$2 WHERE id=$3",
    [total, nivel, cliente_id]
  );

  return { puntos_totales: total, nivel };
};

export const modificarPuntosCliente = async (cliente_id, puntos) => {
  // puntos puede ser positivo o negativo

  // 1. Obtener puntos actuales
  const res = await pool.query(
    "SELECT puntos_totales FROM clientes WHERE id=$1",
    [cliente_id]
  );

  const total = res.rows[0].puntos_totales + puntos;

  if (total < 0) {
    throw new Error("El cliente no tiene puntos suficientes");
  }

  // 2. Obtener nivel según total
  const nivelRes = await pool.query(
    `
    SELECT nombre
    FROM niveles_fidelizacion
    WHERE puntos_min <= $1
      AND (puntos_max IS NULL OR puntos_max >= $1)
    LIMIT 1
    `,
    [total]
  );

  const nivel = nivelRes.rows[0].nombre;

  // 3. Actualizar cliente
  await pool.query(
    "UPDATE clientes SET puntos_totales=$1, nivel=$2 WHERE id=$3",
    [total, nivel, cliente_id]
  );

  return { puntos_totales: total, nivel };
};
