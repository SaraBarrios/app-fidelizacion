import { pool } from "../db/connection.js";

// Obtener todos los usos
export const getAllUsoPuntos = async () => {
  const result = await pool.query("SELECT * FROM uso_puntos ORDER BY id DESC");
  return result.rows;
};

// Obtener uno por ID
export const getUsoPuntoById = async (id) => {
  const result = await pool.query("SELECT * FROM uso_puntos WHERE id = $1", [id]);
  if (!result.rows[0]) return null;

  // Traer detalle también
  const detalle = await pool.query(
    "SELECT * FROM uso_puntos_detalle WHERE uso_id = $1",
    [id]
  );

  return { ...result.rows[0], detalle: detalle.rows };
};

// Crear uso de puntos con FIFO
export const createUsoPunto = async ({ cliente_id, puntaje_utilizado, fecha, concepto_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️. Insertar cabecera
    const resultUso = await client.query(
      `INSERT INTO uso_puntos (cliente_id, puntaje_utilizado, fecha, concepto_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [cliente_id, puntaje_utilizado, fecha, concepto_id]
    );
    const uso_id = resultUso.rows[0].id;

    let puntosRestantes = puntaje_utilizado;

    // 2- Obtener bolsas disponibles (FIFO)
    const bolsas = await client.query(
      `SELECT * FROM bolsa_puntos
       WHERE cliente_id = $1 AND saldo_puntos > 0
       ORDER BY fecha_asignacion ASC`,
      [cliente_id]
    );

    for (let bolsa of bolsas.rows) {
      if (puntosRestantes <= 0) break;

      const aUsar = Math.min(bolsa.saldo_puntos, puntosRestantes);

      // 3️- Insertar en detalle
      await client.query(
        `INSERT INTO uso_puntos_detalle (uso_id, bolsa_id, puntaje_utilizado)
         VALUES ($1,$2,$3)`,
        [uso_id, bolsa.id, aUsar]
      );

      // 4️- Actualizar saldo de la bolsa
      await client.query(
        `UPDATE bolsa_puntos
         SET saldo_puntos = saldo_puntos - $1
         WHERE id = $2`,
        [aUsar, bolsa.id]
      );

      puntosRestantes -= aUsar;
    }

    if (puntosRestantes > 0) {
      throw new Error("No hay suficiente saldo en las bolsas para completar el uso de puntos.");
    }

    await client.query("COMMIT");

    // Traer detalle para devolver
    const detalle = await client.query(
      "SELECT * FROM uso_puntos_detalle WHERE uso_id = $1",
      [uso_id]
    );

    return { ...resultUso.rows[0], detalle: detalle.rows };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Actualizar (solo cabecera)
export const updateUsoPunto = async (id, { puntaje_utilizado, fecha, concepto_id }) => {
  const result = await pool.query(
    `UPDATE uso_puntos
     SET puntaje_utilizado=$1, fecha=$2, concepto_id=$3
     WHERE id=$4 RETURNING *`,
    [puntaje_utilizado, fecha, concepto_id, id]
  );
  return result.rows[0];
};

// Eliminar (cabecera y detalle)
export const deleteUsoPunto = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Restaurar saldo de bolsas
    const detalles = await client.query(
      "SELECT * FROM uso_puntos_detalle WHERE uso_id = $1",
      [id]
    );

    for (let d of detalles.rows) {
      await client.query(
        `UPDATE bolsa_puntos
         SET saldo_puntos = saldo_puntos + $1
         WHERE id = $2`,
        [d.puntaje_utilizado, d.bolsa_id]
      );
    }

    // Borrar detalle
    await client.query("DELETE FROM uso_puntos_detalle WHERE uso_id = $1", [id]);

    // Borrar cabecera
    const result = await client.query("DELETE FROM uso_puntos WHERE id=$1 RETURNING *", [id]);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
