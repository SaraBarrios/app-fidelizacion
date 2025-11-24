# Sistema de Fidelización de Clientes

## Descripción
Este proyecto es un sistema web para la gestión de un programa de fidelización de clientes. Permite:

- Registrar clientes y sus datos personales.
- Asignar puntos por operaciones de pago según reglas configurables.
- Gestionar conceptos de uso de puntos (vales, premios, descuentos, etc.).
- Controlar la bolsa de puntos y su vencimiento.
- Consumir puntos con lógica FIFO y generar comprobantes por correo.
- Consultar información para reportes y seguimiento.

---

## Tecnologías
- Node.js + Express
- PostgreSQL
- npm (para dependencias)
- Node-cron (para scheduler de vencimiento de puntos)
- Postman (para pruebas de API)

---

## Base de Datos

### Tablas principales:

- **clientes**: datos del cliente.
- **conceptos_puntos**: conceptos de canje de puntos.
- **reglas_puntos**: reglas de asignación según monto de operación.
- **vencimientos_puntos**: duración y fechas de validez de los puntos.
- **bolsa_puntos**: historial de puntos asignados a clientes.
- **uso_puntos** y **uso_puntos_detalle**: registro de puntos consumidos.
- **vencimiento_logs**: log de ejecución del proceso de vencimiento.

---

## Endpoints / Módulos

### Clientes
- `POST /clientes` → Crear cliente
- `GET /clientes` → Listar todos los clientes
- `GET /clientes/:id` → Obtener cliente por ID
- `PUT /clientes/:id` → Actualizar cliente
- `DELETE /clientes/:id` → Eliminar cliente

### Conceptos de Puntos
- CRUD similar a clientes (`POST`, `GET`, `PUT`, `DELETE`)

### Reglas de Puntos
- CRUD para asignar puntos según rango de monto de operación

### Vencimientos de Puntos
- CRUD para definir duración y fechas de validez de los puntos

### Bolsa de Puntos
- Se actualiza automáticamente al cargar puntos a un cliente

### Uso de Puntos
- `POST /servicios/utilizarPuntos` → Consumir puntos por concepto, siguiendo lógica FIFO y generar comprobante

### Servicios
- `POST /servicios/cargarPuntos` → Asignar puntos a un cliente según monto de operación
- `POST /servicios/utilizarPuntos` → Consumir puntos por concepto
- `GET /servicios/convertirMontoAPuntos?monto=X` → Ver cuántos puntos corresponden a un monto

---

## Proceso de Vencimiento de Puntos
- Implementado con `node-cron` para ejecutarse automáticamente cada X horas.
- Actualiza las bolsas vencidas (`saldo_puntos = 0`) y registra un log en `vencimiento_logs`.
- Puede ejecutarse manualmente para pruebas llamando a la función:

procesarVencimientos();

## Pruebas
Todos los endpoints pueden probarse con Postman.

## Para probar el scheduler:

1. Inserta bolsas vencidas manualmente.

2. Ejecuta procesarVencimientos() o deja correr el cron.

3. Verifica bolsa_puntos y vencimiento_logs.

## Instalación y Ejecución
1. Clonar el repositorio:
git clone https://github.com/SaraBarrios/app-fidelizacion.git


## Notas
1. Todos los endpoints siguen la misma estructura de CRUD para consistencia.

2. Los puntos se consumen siguiendo lógica FIFO.

2. Se recomienda limpiar la base de datos en desarrollo usando:

SET session_replication_role = replica;

TRUNCATE TABLE uso_puntos_detalle RESTART IDENTITY CASCADE;
TRUNCATE TABLE uso_puntos RESTART IDENTITY CASCADE;
TRUNCATE TABLE bolsa_puntos RESTART IDENTITY CASCADE;
TRUNCATE TABLE conceptos_puntos RESTART IDENTITY CASCADE;
TRUNCATE TABLE reglas_puntos RESTART IDENTITY CASCADE;
TRUNCATE TABLE vencimientos_puntos RESTART IDENTITY CASCADE;
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE vencimiento_logs RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;

3. Mantener los logs de vencimiento permite auditoría y seguimiento de procesos automáticos.

## Autor
Sara B Ramirez - Proyecto de Curso de Arquitectura Web

