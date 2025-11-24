import cron from "node-cron";
import { pool } from "../db/connection.js";

// Función que procesa vencimiento de bolsas
const procesarVencimientos = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Obtener bolsas vencidas con saldo > 0
    const bolsasRes = await client.query(
      `SELECT * FROM bolsa_puntos
       WHERE fecha_caducidad <= CURRENT_DATE
       AND saldo_puntos > 0
       FOR UPDATE`
    );

    let totalActualizadas = 0;

    for (const bolsa of bolsasRes.rows) {
      // Actualizar saldo a 0
      await client.query(
        `UPDATE bolsa_puntos
         SET puntaje_utilizado = puntaje_utilizado + saldo_puntos,
             saldo_puntos = 0
         WHERE id = $1`,
        [bolsa.id]
      );
      totalActualizadas++;
    }

    // Registrar log
    await client.query(
      `INSERT INTO vencimiento_logs(fecha, bolsas_actualizadas) VALUES (NOW(), $1)`,
      [totalActualizadas]
    );

    await client.query("COMMIT");
    console.log(`Proceso vencimiento: ${totalActualizadas} bolsas actualizadas`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error procesando vencimientos:", err);
  } finally {
    client.release();
  }
};

procesarVencimientos();

// Programar la tarea cada X horas
//  cada 1 minuto
cron.schedule("*/1 * * * *", () => {
  console.log("Iniciando proceso de vencimiento de puntos...");
  procesarVencimientos();
});
