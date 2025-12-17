import { pool } from "../db/connection.js";
import nodemailer from "nodemailer";
import { modificarPuntosCliente } from "./clientes.service.js";
import { obtenerPromocionesParaClienteService } from "./promociones.service.js";


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

export const cargarPuntos = async ({ cliente_id, monto_operacion }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Validar cliente,
    const cRes = await client.query("SELECT * FROM clientes WHERE id = $1", [cliente_id]);
    if (cRes.rows.length === 0) throw new Error("Cliente no encontrado");

    // 2. Convertir monto a puntos base
    const puntosBase = await convertirMontoAPuntos(monto_operacion);

    // 3. Obtener promociones válidas para el cliente
    const promociones = await obtenerPromocionesParaClienteService(cliente_id);

    // 4. Calcular puntos bonus (suma de todas las promociones aplicables)
    const bonus = promociones.reduce((sum, p) => sum + (p.puntos_bonus || 0), 0);

    const puntosFinales = puntosBase + bonus;
    
    // 5. Obtener días de validez desde la tabla vencimientos_puntos
    const vRes = await client.query("SELECT dias_duracion FROM vencimientos_puntos LIMIT 1");

    // Si hay dato en tabla se usa, sino → 365
    const diasValidez = vRes.rows.length > 0 ? vRes.rows[0].dias_duracion : 365;

    // 6. Fechas
    const fechaAsignacion = new Date().toISOString().slice(0, 10);
    const resFecha = await client.query(
      "SELECT $1::date + $2::int AS fecha",
      [fechaAsignacion, diasValidez]
    );
    const fechaCaducidad = resFecha.rows[0].fecha;

    // 7. Insertar bolsa de puntos
    const insert = await client.query(
      `INSERT INTO bolsa_puntos 
       (cliente_id, fecha_asignacion, fecha_caducidad, puntaje_asignado, puntaje_utilizado, saldo_puntos, monto_operacion)
       VALUES ($1,$2,$3,$4,0,$4,$5)
       RETURNING *`,
      [cliente_id, fechaAsignacion, fechaCaducidad, puntosFinales, monto_operacion]
    );

    await client.query("COMMIT");
    // ----------------------------
    // Actualizar puntos totales del cliente
    await modificarPuntosCliente(cliente_id, puntosFinales); // puntos positivos en carga
    // ----------------------------
   

    // Preparar mensaje opcional de promoción
    let mensaje = `Has recibido ${puntosBase} puntos por tu operación.`;
    if (bonus > 0) {
      mensaje += ` Además se aplicaron ${bonus} puntos extra por promociones.`;
    }
    
     return {
      ...insert.rows[0],
      mensaje
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ==================== USO DE PUNTOS ====================

export const utilizarPuntos = async ({ cliente_id, concepto_id }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1- Validar cliente
    const cRes = await client.query("SELECT * FROM clientes WHERE id = $1", [cliente_id]);
    if (cRes.rows.length === 0) throw new Error("Cliente no encontrado");

    // 2️ - Validar concepto y obtener puntos requeridos
    const conceptRes = await client.query("SELECT * FROM conceptos_puntos WHERE id = $1", [concepto_id]);
    if (conceptRes.rows.length === 0) throw new Error("Concepto no encontrado");

    const concepto = conceptRes.rows[0];

    // 3- el puntaje a utilizar se define desde el concepto
    const puntajeAUtilizar = concepto.puntos_requeridos;


    //if (puntaje_solicitado < concepto.puntos_requeridos) {
    //  throw new Error(`No se puede canjear este concepto. Se requieren al menos ${concepto.puntos_requeridos} puntos.`);
    //}

    // 4 - Calcular saldo total del cliente
    const saldoRes = await client.query(
      "SELECT COALESCE(SUM(saldo_puntos),0) as total FROM bolsa_puntos WHERE cliente_id = $1",
      [cliente_id]
    );
    const saldoTotal = Number(saldoRes.rows[0].total);
    if (saldoTotal < puntajeAUtilizar) throw new Error("Saldo insuficiente para canjear este concepto");

    // 5 - Insertar cabecera de uso de puntos
    const usoInsert = await client.query(
      `INSERT INTO uso_puntos (cliente_id, puntaje_utilizado, fecha, concepto_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [cliente_id, puntajeAUtilizar, new Date().toISOString().slice(0, 10), concepto_id]
    );
    const uso_id = usoInsert.rows[0].id;

    let puntosRestantes = puntajeAUtilizar;

    // 6 - Obtener bolsas FIFO
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

    // ----------------------------
    // Actualizar puntos del cliente
    await modificarPuntosCliente(cliente_id, -puntajeAUtilizar);
    // ----------------------------

    // Traer detalle para respuesta
    const detalle = await pool.query("SELECT * FROM uso_puntos_detalle WHERE uso_id = $1", [uso_id]);

    // Enviar correo 
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


// ==================== ENVÍO DE CORREO (Ethereal Automático) ====================

let transporter; // se inicializa solo una vez

const initTransporter = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount(); // crea cuenta de prueba
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

const enviarEmailComprobante = async (emailDestino, contenido) => {
  const t = await initTransporter();

  const html = `
    <h2>Comprobante de uso de puntos</h2>
    <p><b>Uso:</b> ${JSON.stringify(contenido.uso)}</p>
    <p><b>Detalle:</b> ${JSON.stringify(contenido.detalle)}</p>
  `;

  const info = await t.sendMail({
    from: '"Sistema Fidelización" <no-reply@fidelizacion.com>',
    to: emailDestino,
    subject: "Comprobante de uso de puntos",
    html
  });

  console.log("Correo enviado: %s", info.messageId);
  console.log("Ver en Ethereal: %s", nodemailer.getTestMessageUrl(info));
};
