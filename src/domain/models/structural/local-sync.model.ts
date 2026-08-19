import type { JsonString, LocalId, LocalSyncMetadata, RemoteId, SQLiteBoolean, TimestampString } from './sync.model';

export interface LocalVarietyRow {
  id: number;
  name: string;
  description?: string | null;
  created_at?: TimestampString | null;
  updated_at?: TimestampString | null;
}

export interface LocalOccurrenceTypeRow {
  id: RemoteId;
  code: string;
  name: string;
  created_at?: TimestampString | null;
}

export interface LocalOperationTypeRow {
  id: RemoteId;
  code: string;
  name: string;
  category?: string | null;
  requires_track: SQLiteBoolean;
  affects_plants: SQLiteBoolean;
  can_generate_occurrences: SQLiteBoolean;
  created_at?: TimestampString | null;
}

export interface LocalZoneRow {
  id: RemoteId;
  name: string;
  description?: string | null;
  boundary_geojson?: JsonString | null;
  created_at?: TimestampString | null;
  updated_at?: TimestampString | null;
  sync_status: string;
}

export interface LocalPlantRow extends LocalSyncMetadata {
  id: RemoteId;
  remote_plant_id?: RemoteId | null;
  latitude: number;
  longitude: number;
  zone_id?: RemoteId | null;
  zone_name?: string | null;
  variety_id?: number | null;
  variety_name?: string | null;
  mass?: string | null;
  harvest?: string | null;
  planting_date?: TimestampString | null;
  life_of_the_tree?: string | null;
  description?: string | null;
  is_dead: SQLiteBoolean;
  is_new: SQLiteBoolean;
  non_existent: SQLiteBoolean;
  created_at?: TimestampString | null;
  updated_at?: TimestampString | null;
  synced_at?: TimestampString | null;
  record_origin?: 'remote_cache' | 'local_registration' | null;
}

export interface LocalPlantOccurrenceRow extends LocalSyncMetadata {
  id: RemoteId;
  plant_id: RemoteId;
  occurrence_type_id: RemoteId;
  field_operation_id?: RemoteId | null;
  observed_at: TimestampString;
  severity?: string | null;
  status: string;
  notes?: string | null;
  annotation_latitude?: number | null;
  annotation_longitude?: number | null;
  gps_accuracy_m?: number | null;
  assigned_distance_meters?: number | null;
  assignment_method?: string | null;
  assignment_status?: string | null;
  resolved_at?: TimestampString | null;
  created_at?: TimestampString | null;
  updated_at?: TimestampString | null;
}

export interface LocalFieldOperationRow extends LocalSyncMetadata {
  id: RemoteId;
  operation_type_id?: RemoteId | null;
  operation_type_code?: string | null;
  zone_id?: RemoteId | null;
  target_occurrence_type_id?: RemoteId | null;
  title?: string | null;
  source: string;
  started_at: TimestampString;
  finished_at?: TimestampString | null;
  operator_name?: string | null;
  machine_name?: string | null;
  tractor_identifier?: string | null;
  notes?: string | null;
  map_color?: string | null;
  created_at?: TimestampString | null;
  updated_at?: TimestampString | null;
}

export interface LocalInspectionTargetRow extends LocalSyncMetadata {
  id: RemoteId;
  field_operation_id: RemoteId;
  plant_id: RemoteId;
  occurrence_type_id?: RemoteId | null;
  route_order?: number | null;
  status: string;
  distance_from_previous_meters?: number | null;
  visited_at?: TimestampString | null;
  notes?: string | null;
  created_at?: TimestampString | null;
}

export interface SyncQueueRow {
  id: LocalId;
  entity_name: string;
  entity_local_id: LocalId;
  action: string;
  payload_json: JsonString;
  status: string;
  attempts: number;
  last_error?: string | null;
  created_at: TimestampString;
  updated_at: TimestampString;
}
