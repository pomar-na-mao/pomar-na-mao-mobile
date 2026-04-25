import { type SQLiteDatabase } from 'expo-sqlite';

export async function dropDatabases(database: SQLiteDatabase) {
  await database.execAsync(`DROP TABLE IF EXISTS inspect_routines;`);
  await database.execAsync(`DROP TABLE IF EXISTS annotations;`);
  await database.execAsync(`DROP TABLE IF EXISTS new_plants;`);
  await database.execAsync(`DROP TABLE IF EXISTS routine_plants;`);
}

export async function initializeDatabases(database: SQLiteDatabase) {
  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS inspect_routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      region TEXT NOT NULL,
      plant_data TEXT NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL,
      longitude REAL,
      information TEXT NOT NULL,
      occurrences TEXT NOT NULL,
      created_at TEXT NOT NULL
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS new_plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL,
      longitude REAL,
      gps_timestamp INTEGER,
      created_at TEXT NOT NULL,
      region TEXT NOT NULL
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS routine_plants (
      id TEXT PRIMARY KEY NOT NULL,
      plant_data TEXT NOT NULL,
      updated_at TEXT NOT NULL
      );
    `,
  );
}
