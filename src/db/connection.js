import pg from "pg";

export const pool = new pg.Pool({
  host: "localhost",
  user: "postgres",
  password: "admin123",
  database: "fidelizacion",
  port: 5432
});


export default pool;