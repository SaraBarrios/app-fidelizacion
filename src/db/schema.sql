CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    numero_documento VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    nacionalidad VARCHAR(50),
    email VARCHAR(150),
    telefono VARCHAR(50),
    fecha_nacimiento DATE
);

-- insert para pruebas -- 
INSERT INTO clientes 
(nombre, apellido, numero_documento, tipo_documento, nacionalidad,
email, telefono, fecha_nacimiento) 
  VALUES ('Sara', 'Barrios', '6091736', 'CI', 'Paraguaya', 'saritabarrar@gmail.com', '0982937989', '1998-04-22');

INSERT INTO clientes 
(nombre, apellido, numero_documento, tipo_documento, nacionalidad,
email, telefono, fecha_nacimiento) 
  VALUES ('Rodney', 'Arrua', '4905192', 'CI', 'Paraguaya', 'rodney_arrua99@gmail.com', '0982390739', '1996/02/10');


CREATE TABLE conceptos_puntos (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    puntos_requeridos INT NOT NULL
);

CREATE TABLE reglas_puntos (
    id SERIAL PRIMARY KEY,
    limite_inferior INT,          
    limite_superior INT,         
    equivalencia INT NOT NULL     
);

CREATE TABLE vencimientos_puntos (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_duracion INT NOT NULL
);

CREATE TABLE bolsa_puntos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    fecha_asignacion DATE NOT NULL,
    fecha_caducidad DATE NOT NULL,
    puntaje_asignado INT NOT NULL,
    puntaje_utilizado INT DEFAULT 0,
    saldo_puntos INT NOT NULL,
    monto_operacion INT NOT NULL
);


CREATE TABLE uso_puntos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    puntaje_utilizado INT NOT NULL,
    fecha DATE NOT NULL,
    concepto_id INT NOT NULL REFERENCES conceptos_puntos(id)
);

CREATE TABLE uso_puntos_detalle (
    id SERIAL PRIMARY KEY,
    uso_id INT NOT NULL REFERENCES uso_puntos(id),
    bolsa_id INT NOT NULL REFERENCES bolsa_puntos(id),
    puntaje_utilizado INT NOT NULL
);

CREATE TABLE vencimiento_logs (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT NOW(),
    bolsas_actualizadas INT
);


--PARA SEGUNDO FINAL
--PARA TABLA DE CLIENTES

ALTER TABLE clientes ADD COLUMN ciudad VARCHAR(100); 
ALTER TABLE clientes ADD COLUMN nivel VARCHAR(50) DEFAULT 'BASICO';
--Niveles posibles: BASICO, PLATA, ORO, DIAMANTE
ALTER TABLE clientes ADD COLUMN puntos_totales INT DEFAULT 0;


CREATE TABLE promociones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    puntos_bonus INT DEFAULT 0,
    edad_min INT,
    edad_max INT,
    nacionalidad VARCHAR(50),
    ciudad VARCHAR(100),
    puntos_min INT,
    puntos_max INT,
    nivel_requerido VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE
);


CREATE TABLE niveles_fidelizacion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  puntos_min INT NOT NULL,
  puntos_max INT,
  descripcion TEXT
);
