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

// SERVICIO PROMOCIONES PERSONALIZADAS
export const obtenerPromocionesParaClienteService = async (clienteId) => {
  // 1) Obtener datos del cliente
  const clienteQuery = `
    SELECT 
      c.*,
      EXTRACT(YEAR FROM AGE(c.fecha_nacimiento)) AS edad,
      COALESCE(SUM(b.saldo_puntos),0) AS puntos_actuales
    FROM clientes c
    LEFT JOIN bolsa_puntos b ON c.id = b.cliente_id
    WHERE c.id = $1
    GROUP BY c.id
  `;
  
  const clienteRes = await pool.query(clienteQuery, [clienteId]);
  if (clienteRes.rowCount === 0) return [];

  const clienteRaw = clienteRes.rows[0];

  // 2) Convertir edad y puntos a número
  const cliente = {
    ...clienteRaw,
    edad: Number(clienteRaw.edad),
    puntos_actuales: Number(clienteRaw.puntos_actuales)
  };

  console.log('Cliente para promociones:', cliente);

  // 3) Filtrar promociones según atributos del cliente
  const promosQuery = `
  SELECT *
  FROM promociones
  WHERE (edad_min IS NULL OR $1 >= edad_min)
    AND (edad_max IS NULL OR $1 <= edad_max)
    AND (nacionalidad IS NULL OR nacionalidad = $2)
    AND (ciudad IS NULL OR ciudad ILIKE $3)
    AND (nivel_requerido IS NULL OR nivel_requerido ILIKE $4)
    AND (puntos_min IS NULL OR $5 >= puntos_min)
    AND (puntos_max IS NULL OR $5 <= puntos_max)
    AND (fecha_inicio IS NULL OR fecha_fin IS NULL OR (CURRENT_DATE >= fecha_inicio AND CURRENT_DATE <= fecha_fin))
`;

  const promoRes = await pool.query(promosQuery, [
    cliente.edad,
    cliente.nacionalidad,
    cliente.ciudad,
    cliente.nivel,
    cliente.puntos_actuales,
  ]);

  return promoRes.rows;
};
