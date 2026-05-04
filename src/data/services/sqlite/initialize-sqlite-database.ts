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

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      active_ingredient TEXT,
      category TEXT,
      concentration REAL,
      unit TEXT DEFAULT 'ml/L',
      manufacturer TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT,
      synced_at TEXT,
      dirty INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS spraying_sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT,
      ended_at TEXT,
      operator_name TEXT,
      status TEXT DEFAULT 'in_progress',
      region TEXT,
      notes TEXT,
      water_volume_liters REAL,
      created_at TEXT,
      synced_at TEXT,
      dirty INTEGER DEFAULT 1,
      deleted INTEGER DEFAULT 0
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS spraying_products (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      dose REAL NOT NULL,
      dose_unit TEXT DEFAULT 'ml/L',
      synced_at TEXT,
      dirty INTEGER DEFAULT 1,
      deleted INTEGER DEFAULT 0,
      UNIQUE(session_id, product_id)
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS spraying_route_points (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      gps_timestamp INTEGER,
      accuracy REAL,
      synced_at TEXT
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS spraying_plants (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      plant_id TEXT NOT NULL,
      distance_meters REAL,
      association_method TEXT DEFAULT 'auto',
      synced_at TEXT,
      dirty INTEGER DEFAULT 1,
      deleted INTEGER DEFAULT 0,
      UNIQUE(session_id, plant_id)
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_route_session ON spraying_route_points(session_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_spraying_plants_session ON spraying_plants(session_id);
  `);
}
