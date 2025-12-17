import { pool } from "../db/connection.js";

// CREAR PROMOCIÓN
export const crearPromocionService = async (data) => {
  const {
    titulo,
    descripcion,
    puntos_bonus,
    edad_min,
    edad_max,
    nacionalidad,
    ciudad,
    puntos_min,
    puntos_max,
    nivel_requerido,
    fecha_inicio,
    fecha_fin,
  } = data;

  const query = `
    INSERT INTO promociones (
      titulo, descripcion, puntos_bonus,
      edad_min, edad_max, nacionalidad, ciudad,
      puntos_min, puntos_max, nivel_requerido,
      fecha_inicio, fecha_fin
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    RETURNING *
  `;

  const values = [
    titulo,
    descripcion,
    puntos_bonus || 0,
    edad_min || null,
    edad_max || null,
    nacionalidad || null,
    ciudad || null,
    puntos_min || null,
    puntos_max || null,
    nivel_requerido || null,
    fecha_inicio || null,
    fecha_fin || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// LISTAR PROMOCIONES
export const getPromocionesService = async () => {
  const result = await pool.query("SELECT * FROM promociones ORDER BY id DESC");
  return result.rows;
};

// ACTUALIZAR PROMOCIÓN
export const updatePromocionService = async (id, data) => {
  const {
    titulo,
    descripcion,
    puntos_bonus,
    edad_min,
    edad_max,
    nacionalidad,
    ciudad,
    puntos_min,
    puntos_max,
    nivel_requerido,
    fecha_inicio,
    fecha_fin,
  } = data;

  const query = `
    UPDATE promociones SET
      titulo=$1,
      descripcion=$2,
      puntos_bonus=$3,
      edad_min=$4,
      edad_max=$5,
      nacionalidad=$6,
      ciudad=$7,
      puntos_min=$8,
      puntos_max=$9,
      nivel_requerido=$10,
      fecha_inicio=$11,
      fecha_fin=$12
    WHERE id=$13
    RETURNING *
  `;

  const values = [
    titulo,
    descripcion,
    puntos_bonus,
    edad_min,
    edad_max,
    nacionalidad,
    ciudad,
    puntos_min,
    puntos_max,
    nivel_requerido,
    fecha_inicio,
    fecha_fin,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ELIMINAR PROMOCIÓN
export const deletePromocionService = async (id) => {
  await pool.query("DELETE FROM promociones WHERE id=$1", [id]);
};

// ================================
// SERVICIO PROMOCIONES PERSONALIZADAS
// ================================
export const obtenerPromocionesParaClienteService = async (clienteId) => {

  /* 
     1. Obtener datos del cliente
  */
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

  const cliente = {
    ...clienteRaw,
    edad: Number(clienteRaw.edad),
    puntos_actuales: Number(clienteRaw.puntos_actuales)
  };

  /*
     2. Buscar promociones
     - Vigentes
     - Compatibles con el cliente
     - NO utilizadas
  */
  const promosQuery = `
    SELECT p.*
    FROM promociones p
    WHERE (p.edad_min IS NULL OR $1 >= p.edad_min)
      AND (p.edad_max IS NULL OR $1 <= p.edad_max)
      AND (p.nacionalidad IS NULL OR p.nacionalidad = $2)
      AND (p.ciudad IS NULL OR p.ciudad ILIKE $3)
      AND (p.nivel_requerido IS NULL OR p.nivel_requerido ILIKE $4)
      AND (p.puntos_min IS NULL OR $5 >= p.puntos_min)
      AND (p.puntos_max IS NULL OR $5 <= p.puntos_max)
      AND (
        p.fecha_inicio IS NULL 
        OR p.fecha_fin IS NULL 
        OR CURRENT_DATE BETWEEN p.fecha_inicio AND p.fecha_fin
      )
      AND NOT EXISTS (
        SELECT 1
        FROM promociones_uso pu
        WHERE pu.promocion_id = p.id
          AND pu.cliente_id = $6
      )
  `;

  const promoRes = await pool.query(promosQuery, [
    cliente.edad,
    cliente.nacionalidad,
    cliente.ciudad,
    cliente.nivel,
    cliente.puntos_actuales,
    clienteId
  ]);

  return promoRes.rows;
};
