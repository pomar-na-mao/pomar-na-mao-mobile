import { type SQLiteDatabase } from 'expo-sqlite';

export async function dropDatabases(database: SQLiteDatabase) {}

export async function initializeDatabases(database: SQLiteDatabase) {
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

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_inspections (
      id TEXT PRIMARY KEY,
      zone_id TEXT,
      zone_name TEXT,
      occurrence_type_id TEXT,
      occurrence_code TEXT,
      occurrence_name TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress',
      sync_status TEXT NOT NULL DEFAULT 'pending',
      started_at TEXT NOT NULL,
      finished_at TEXT,
      plants_loaded_count INTEGER NOT NULL DEFAULT 0,
      plants_changed_count INTEGER NOT NULL DEFAULT 0,
      current_latitude REAL,
      current_longitude REAL,
      nearest_plant_id TEXT,
      nearest_distance_meters REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      remote_field_operation_id TEXT,
      synced_at TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspections_status ON local_inspections(status);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspections_sync_status ON local_inspections(sync_status);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_inspection_loaded_plants (
      id TEXT PRIMARY KEY,
      inspection_local_id TEXT NOT NULL,
      plant_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      zone_id TEXT,
      zone_name TEXT,
      variety_id INTEGER,
      variety_name TEXT,
      occurrences_json TEXT NOT NULL DEFAULT '[]',
      is_nearest INTEGER NOT NULL DEFAULT 0,
      is_changed INTEGER NOT NULL DEFAULT 0,
      distance_meters REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_loaded_plants_inspection
    ON local_inspection_loaded_plants(inspection_local_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_loaded_plants_plant
    ON local_inspection_loaded_plants(plant_id);
  `);

  await database.execAsync(
    `
     CREATE TABLE IF NOT EXISTS local_inspection_changes (
      id TEXT PRIMARY KEY,
      inspection_local_id TEXT NOT NULL,
      plant_id TEXT NOT NULL,
      change_type TEXT NOT NULL,
      occurrence_type_id TEXT NOT NULL,
      occurrence_code TEXT NOT NULL,
      occurrence_name TEXT NOT NULL,
      previous_value_json TEXT,
      new_value_json TEXT,
      severity TEXT,
      notes TEXT,
      latitude REAL,
      longitude REAL,
      gps_accuracy_m REAL,
      distance_to_plant_meters REAL,
      changed_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      remote_occurrence_id TEXT,
      sync_error TEXT
      );
    `,
  );

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_changes_inspection
    ON local_inspection_changes(inspection_local_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_changes_plant
    ON local_inspection_changes(plant_id);
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_inspection_changes_sync_status
    ON local_inspection_changes(sync_status);
  `);
}
