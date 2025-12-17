import { utilizarPuntos } from "./servicios.service.js";

export const canjearPuntos = async ({ cliente_id, concepto_id }) => {


  //   1. Validaciones basicas

  if (!cliente_id || !concepto_id) {
    throw new Error("cliente_id y concepto_id son obligatorios");
  }

  
  // 2. Ejecutar canje (toda la logica vive en utilizarPuntos)
 
  const resultado = await utilizarPuntos({
    cliente_id,
    concepto_id
  });

  return {
    tipo: "CANJE_PUNTOS",
    mensaje: "Canje de puntos realizado correctamente",
    uso: resultado
  };
};