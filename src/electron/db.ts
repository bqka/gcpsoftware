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
  const hasDoubleWire = await db.schema.hasTable("doublewire");
  if (!hasDoubleWire) {
    await db.schema.createTable("doublewire", (table) => {
      table.increments("id").primary();
      table.text("sequence");
      table.text("image_front");
      table.text("image_back");
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }

  const hasSingleWire = await db.schema.hasTable("singlewire");
  if (!hasSingleWire) {
    await db.schema.createTable("singlewire", (table) => {
      table.increments("id").primary();
      table.text("sequence");
      table.text("path");
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }

  const hasResults = await db.schema.hasTable("results");
  if (!hasResults) {
    await db.schema.createTable("results", (table) => {
      table.increments("id").primary();
      table.text("wire_type");
      table.integer("wire_id");
      table.boolean("result");
      table.text("details");
      table.timestamp("compared_at").defaultTo(db.fn.now());
      table.text("tested_by");
      table.text("image_front");
      table.text("image_back");
    });
  }

  console.log("All tables initialized.");
}