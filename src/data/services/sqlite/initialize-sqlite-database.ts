import { type SQLiteDatabase } from 'expo-sqlite';

export async function dropDatabases(database: SQLiteDatabase) {
  await database.execAsync(`DROP TABLE IF EXISTS inspect_routines;`);
  await database.execAsync(`DROP TABLE IF EXISTS inspect_annotations;`);
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
     CREATE TABLE IF NOT EXISTS inspect_annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL,
      longitude REAL,
      information TEXT NOT NULL,
      occurrences TEXT NOT NULL,
      created_at TEXT NOT NULL
      );
    `,
  );
}
