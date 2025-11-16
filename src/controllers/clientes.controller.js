// export const createCliente = async (req, res) => {};
// export const getClientes = async (req, res) => {};
// export const getClienteById = async (req, res) => {};
// export const updateCliente = async (req, res) => {};
// export const deleteCliente = async (req, res) => {};

import { pool } from "../db/connection.js";
export const getClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes');
    // result.rows: contiene un arreglo con todas las filas devueltas por la consulta.
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};


export const getClienteById = async (req, res) => { //funcion asincrona
  const { id } = req.params; // obtenemos el id de la URL
  try {
    // Usamos $1 como placeholder y pasamos [id] como parámetro
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);

    // result.rows → arreglo con las filas devueltas por la consulta
    // result.rows.length → cantidad de filas encontradas
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    };
    res.json(result.rows[0]); // enviamos solo el cliente encontrado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};


export const deleteCliente = async (req, res) => {
  const { id } = req.params;

  // Validación para asegurar que el ID sea numero
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const { rows, rowCount } = await pool.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING *",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({
      status: 200,
      mensaje: "Cliente eliminado correctamente",
      cliente: rows[0] //con esto devuelvo el user eliminado, es opcional
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Error al eliminar cliente" });
  }
};


export const createCliente = async (req, res) => {

  // Traigo los datos que vienen en el body de la petición
  const {
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento
  } = req.body;

  try {
    // Verifico que los campos obligatorios no vengan vacíos
    if (!nombre || !apellido || !numero_documento || !tipo_documento) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Consulta SQL para insertar un cliente nuevo
    const query = `
      INSERT INTO clientes 
      (nombre, apellido, numero_documento, tipo_documento, nacionalidad, email, telefono, fecha_nacimiento)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    // Valores que voy a pasarle a la consulta SQL
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

    // Ejecuto la consulta en la base de datos
    const { rows } = await pool.query(query, values);

    // Respondo al cliente con un mensaje y el objeto insertado
    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente: rows[0] // rows[0] es el cliente recién creado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const updateCliente = async (req, res) => {
  // Obtengo el ID que viene por la URL
  const { id } = req.params;

   // Verifico que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  
  // Traigo los datos que vienen en el body
  const {
    nombre,
    apellido,
    numero_documento,
    tipo_documento,
    nacionalidad,
    email,
    telefono,
    fecha_nacimiento
  } = req.body;

  try {

    // Reviso que los campos obligatorios no estén vacíos
    if (!nombre || !apellido || !numero_documento || !tipo_documento) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
   
    // Consulta SQL para actualizar el cliente
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
    
    // Valores que voy a pasar a la consulta
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
    
    // Ejecuto la consulta en la base de datos
    const { rows, rowCount } = await pool.query(query, values);
    
    // Si rowCount es 0, significa que no existe el cliente con ese ID
    if (rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    // Envío la respuesta con el cliente actualizado
    res.json({
      mensaje: "Cliente actualizado correctamente",
      cliente: rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};