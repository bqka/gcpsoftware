import knex from "knex";
import { Knex } from "knex";

// Define the database connection configuration
const dbConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "aadi",
    database: "itpsoftware",
  },
  pool: { min: 2, max: 10 },
};

const db = knex(dbConfig);

export default db;