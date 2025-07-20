import { app } from "electron";
import knex, { Knex } from "knex";
import path from "path";

const dbPath = path.join(app.getPath("userData"), "database.sqlite");

const dbConfig: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
  pool: { min: 2, max: 10 },
};

export const db: Knex = knex(dbConfig);

export async function initializeDatabase() {
  const hasWires = await db.schema.hasTable("wires");
  if (!hasWires) {
    await db.schema.createTable("wires", (table) => {
      table.increments("id").primary();
      table.text("wire_name").notNullable();
      table.text("wire_type").notNullable();
      table.text("sequence").notNullable();
      table.text("image_front").notNullable();
      table.text("image_back");
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }

  const hasResults = await db.schema.hasTable("results");
  if (!hasResults) {
    await db.schema.createTable("results", (table) => {
      table.increments("id").primary();
      table.text("wire_type").notNullable();
      table.integer("wire_id").notNullable();
      table.text("wire_name").notNullable();
      table.boolean("result").notNullable();
      table.text("details").notNullable();
      table.timestamp("compared_at").defaultTo(db.fn.now());
      table.text("tested_by").notNullable();
      table.text("image_front").notNullable();
      table.text("image_back");
    });
  }

  const hasMismatch = await db.schema.hasTable("mismatch");
  if(!hasMismatch){
    await db.schema.createTable("mismatch", (table) => {
      table.increments("id").primary();
      table.timestamp("date").defaultTo(db.fn.now());
      table.text("wire_name").notNullable;
      table.text("wire_type").notNullable();
      table.text("sequence").notNullable();
      table.text("image_front").notNullable();
      table.text("image_back");
    })
  }

  console.log("All tables initialized.");
}