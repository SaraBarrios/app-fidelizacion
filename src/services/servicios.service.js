import { pool } from "../db/connection.js";
import nodemailer from "nodemailer";

// ==================== UTILITARIOS ====================

// Obtener regla de asignación de puntos según monto
const obtenerReglaParaMonto = async (monto) => {
  const { rows } = await pool.query(`
    SELECT * FROM reglas_puntos
    WHERE (limite_inferior IS NULL OR $1 >= limite_inferior)
      AND (limite_superior IS NULL OR $1 <= limite_superior)
    ORDER BY limite_inferior NULLS FIRST
    LIMIT 1
  `, [monto]);
  return rows[0] || null;
};

// Convertir monto a puntos usando reglas
export const convertirMontoAPuntos = async (monto) => {
  const regla = await obtenerReglaParaMonto(monto);
  if (!regla) throw new Error("No existe regla de asignación para el monto proporcionado");
  return Math.floor(monto / regla.equivalencia);
};

// ==================== CARGA DE PUNTOS ====================

export const cargarPuntos = async ({ cliente_id, monto_operacion, fecha_asignacion, dias_validez }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validar cliente
    const cRes = await client.query("SELECT * FROM clientes WHERE id = $1", [cliente_id]);
    if (cRes.rows.length === 0) throw new Error("Cliente no encontrado");

    // Calcular puntos
    const puntos = await convertirMontoAPuntos(monto_operacion);

    // Calcular fechas
    const fechaAsign = fecha_asignacion || new Date().toISOString().slice(0, 10);
    const resFecha = await client.query("SELECT $1::date + $2::int AS cd", [fechaAsign, dias_validez || 365]);
    const fechaCaducidad = resFecha.rows[0].cd;

    // Insertar bolsa de puntos
    const insert = await client.query(
      `INSERT INTO bolsa_puntos 
       (cliente_id, fecha_asignacion, fecha_caducidad, puntaje_asignado, puntaje_utilizado, saldo_puntos, monto_operacion)
       VALUES ($1,$2,$3,$4,0,$4,$5) RETURNING *`,
      [cliente_id, fechaAsign, fechaCaducidad, puntos, monto_operacion]
    );

    await client.query("COMMIT");
    return insert.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ==================== USO DE PUNTOS ====================

export const utilizarPuntos = async ({ cliente_id, puntaje_solicitado, concepto_id, fecha }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Validar cliente
    const cRes = await client.query("SELECT * FROM clientes WHERE id = $1", [cliente_id]);
    if (cRes.rows.length === 0) throw new Error("Cliente no encontrado");

    // 2️⃣ Validar concepto y obtener puntos requeridos
    const conceptRes = await client.query("SELECT * FROM conceptos_puntos WHERE id = $1", [concepto_id]);
    if (conceptRes.rows.length === 0) throw new Error("Concepto no encontrado");

    const concepto = conceptRes.rows[0];

    // 3️⃣ Validar que puntaje_solicitado cumpla con puntos_requeridos del concepto
    if (puntaje_solicitado < concepto.puntos_requeridos) {
      throw new Error(`No se puede canjear este concepto. Se requieren al menos ${concepto.puntos_requeridos} puntos.`);
    }

    // 4️⃣ Calcular saldo total del cliente
    const saldoRes = await client.query(
      "SELECT COALESCE(SUM(saldo_puntos),0) as total FROM bolsa_puntos WHERE cliente_id = $1",
      [cliente_id]
    );
    const saldoTotal = Number(saldoRes.rows[0].total);
    if (saldoTotal < puntaje_solicitado) throw new Error("Saldo insuficiente para canjear este concepto");

    // 5️⃣ Insertar cabecera de uso de puntos
    const usoInsert = await client.query(
      `INSERT INTO uso_puntos (cliente_id, puntaje_utilizado, fecha, concepto_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [cliente_id, puntaje_solicitado, fecha || new Date().toISOString().slice(0, 10), concepto_id]
    );
    const uso_id = usoInsert.rows[0].id;

    let puntosRestantes = puntaje_solicitado;

    // 6️⃣ Obtener bolsas FIFO
    const bolsasRes = await client.query(
      `SELECT * FROM bolsa_puntos WHERE cliente_id = $1 AND saldo_puntos > 0 ORDER BY fecha_asignacion ASC FOR UPDATE`,
      [cliente_id]
    );

    for (const bolsa of bolsasRes.rows) {
      if (puntosRestantes <= 0) break;
      const usar = Math.min(bolsa.saldo_puntos, puntosRestantes);

      // Insertar detalle
      await client.query(
        `INSERT INTO uso_puntos_detalle (uso_id, bolsa_id, puntaje_utilizado) VALUES ($1,$2,$3)`,
        [uso_id, bolsa.id, usar]
      );

      // Actualizar bolsa
      await client.query(
        `UPDATE bolsa_puntos
         SET puntaje_utilizado = puntaje_utilizado + $1,
             saldo_puntos = saldo_puntos - $1
         WHERE id = $2`,
        [usar, bolsa.id]
      );

      puntosRestantes -= usar;
    }

    if (puntosRestantes > 0) throw new Error("Saldo insuficiente al intentar consumir");

    await client.query("COMMIT");

    // Traer detalle para respuesta
    const detalle = await pool.query("SELECT * FROM uso_puntos_detalle WHERE uso_id = $1", [uso_id]);

    // Enviar correo (opcional)
    const cliente = cRes.rows[0];
    enviarEmailComprobante(cliente.email, {
      uso: usoInsert.rows[0],
      detalle: detalle.rows
    }).catch(e => console.error("Error enviando email:", e));

    return { ...usoInsert.rows[0], detalle: detalle.rows };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


// ==================== ENVÍO DE CORREO (Ethereal) ====================

const enviarEmailComprobante = async (emailDestino, contenido) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "joyce.zieme@ethereal.email",
      pass: "NrPyuhWJaBrBEc5EjS"
    }
  });

  const html = `
    <h2>Comprobante de uso de puntos</h2>
    <p><b>Uso:</b> ${JSON.stringify(contenido.uso)}</p>
    <p><b>Detalle:</b> ${JSON.stringify(contenido.detalle)}</p>
  `;

  const info = await transporter.sendMail({
    from: '"Sistema Fidelización" <no-reply@fidelizacion.com>',
    to: emailDestino,
    subject: "Comprobante de uso de puntos",
    html
  });

  console.log("Correo enviado, ver en Ethereal:", nodemailer.getTestMessageUrl(info));
};
