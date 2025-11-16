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


INSERT INTO clientes 
(nombre, apellido, numero_documento, tipo_documento, nacionalidad,
email, telefono, fecha_nacimiento) 
  VALUES ('Sara', 'Barrios', '6091736', 'CI', 'Paraguaya', 'saritabarrar@gmail.com', '0982937989', '1998-04-22');

INSERT INTO clientes 
(nombre, apellido, numero_documento, tipo_documento, nacionalidad,
email, telefono, fecha_nacimiento) 
  VALUES ('Rodney', 'Arrua', '4905192', 'CI', 'Paraguaya', 'rodney_arrua99@gmail.com', '0982390739', '1996/02/10');
