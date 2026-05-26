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

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_varieties (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT,
      updated_at TEXT
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_occurrence_types (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_operation_types (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      requires_track INTEGER NOT NULL DEFAULT 0,
      affects_plants INTEGER NOT NULL DEFAULT 1,
      can_generate_occurrences INTEGER NOT NULL DEFAULT 0,
      created_at TEXT
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      boundary_geojson TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced'
      );
    `,
  );

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_plants (
      id TEXT PRIMARY KEY,
      local_id TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      zone_id TEXT,
      zone_name TEXT,
      variety_id INTEGER,
      variety_name TEXT,
      mass TEXT,
      harvest TEXT,
      planting_date TEXT,
      life_of_the_tree TEXT,
      description TEXT,
      is_dead INTEGER NOT NULL DEFAULT 0,
      is_new INTEGER NOT NULL DEFAULT 0,
      non_existent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      device_id TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_plants_zone ON local_plants(zone_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_plants_variety ON local_plants(variety_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_plants_lat_lng ON local_plants(latitude, longitude);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_plant_occurrences (
      id TEXT PRIMARY KEY,
      local_id TEXT,
      plant_id TEXT NOT NULL,
      occurrence_type_id TEXT NOT NULL,
      field_operation_id TEXT,
      observed_at TEXT NOT NULL,
      severity TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      notes TEXT,
      annotation_latitude REAL,
      annotation_longitude REAL,
      gps_accuracy_m REAL,
      assigned_distance_meters REAL,
      assignment_method TEXT,
      assignment_status TEXT,
      resolved_at TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      device_id TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_occurrences_plant ON local_plant_occurrences(plant_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_occurrences_type ON local_plant_occurrences(occurrence_type_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_occurrences_status ON local_plant_occurrences(status);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_field_operations (
      id TEXT PRIMARY KEY,
      local_id TEXT,
      operation_type_id TEXT,
      operation_type_code TEXT,
      zone_id TEXT,
      target_occurrence_type_id TEXT,
      title TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      started_at TEXT NOT NULL,
      finished_at TEXT,
      operator_name TEXT,
      machine_name TEXT,
      tractor_identifier TEXT,
      notes TEXT,
      map_color TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      device_id TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_operations_type ON local_field_operations(operation_type_code);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_operations_started_at ON local_field_operations(started_at);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_inspection_targets (
      id TEXT PRIMARY KEY,
      local_id TEXT,
      field_operation_id TEXT NOT NULL,
      plant_id TEXT NOT NULL,
      occurrence_type_id TEXT,
      route_order INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      distance_from_previous_meters REAL,
      visited_at TEXT,
      notes TEXT,
      created_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      device_id TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_targets_operation ON local_inspection_targets(field_operation_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_targets_plant ON local_inspection_targets(plant_id);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_name TEXT NOT NULL,
      entity_local_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
      );
    `,
  );
}
