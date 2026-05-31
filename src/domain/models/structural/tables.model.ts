import type { JsonString, RemoteId, RemoteSyncMetadata, RemoteTimestamps, TimestampString } from './sync.model';

export interface VarietyTable extends Pick<RemoteTimestamps, 'created_at'> {
  id: number;
  name: string;
  description?: string | null;
}

export interface ZoneTable extends RemoteTimestamps, RemoteSyncMetadata {
  id: RemoteId;
  name: string;
  code?: string | null;
  description?: string | null;
  boundary?: JsonString | null;
}

export interface PlantTable extends RemoteTimestamps, RemoteSyncMetadata {
  id: RemoteId;
  latitude: number;
  longitude: number;
  location?: JsonString | null;
  gps_timestamp?: number | null;
  variety_id?: number | null;
  zone_id?: RemoteId | null;
  mass?: string | null;
  harvest?: string | null;
  description?: string | null;
  planting_date?: TimestampString | null;
  life_of_the_tree?: string | null;
  is_dead: boolean;
  is_new: boolean;
  non_existent: boolean;
}

export interface OccurrenceTypeTable extends Pick<RemoteTimestamps, 'created_at'> {
  id: RemoteId;
  name: string;
  code: string;
}

export interface OperationTypeTable extends Pick<RemoteTimestamps, 'created_at'> {
  id: RemoteId;
  code: string;
  name: string;
  category?: string | null;
  requires_track: boolean;
  affects_plants: boolean;
  can_generate_occurrences: boolean;
}

export interface FieldOperationTable extends RemoteTimestamps, RemoteSyncMetadata {
  id: RemoteId;
  operation_type_id: RemoteId;
  zone_id?: RemoteId | null;
  target_occurrence_type_id?: RemoteId | null;
  title?: string | null;
  source: 'manual' | 'gps_track' | 'imported' | 'automatic' | string;
  started_at: TimestampString;
  finished_at?: TimestampString | null;
  operator_name?: string | null;
  machine_name?: string | null;
  tractor_identifier?: string | null;
  notes?: string | null;
  map_color?: string | null;
}

export interface FieldOperationTrackPointTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: number;
  field_operation_id: RemoteId;
  recorded_at: TimestampString;
  latitude: number;
  longitude: number;
  location?: JsonString | null;
  speed_mps?: number | null;
  accuracy_m?: number | null;
}

export interface FieldOperationRouteTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: RemoteId;
  field_operation_id: RemoteId;
  route?: JsonString | null;
  distance_meters?: number | null;
  started_at?: TimestampString | null;
  finished_at?: TimestampString | null;
}

export interface PlantOperationHistoryTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: RemoteId;
  plant_id: RemoteId;
  field_operation_id: RemoteId;
  operation_type_id: RemoteId;
  matched_at?: TimestampString | null;
  nearest_track_point_id?: number | null;
  distance_meters?: number | null;
  match_source: 'auto_matched' | 'manual_added' | 'imported' | string;
  status: 'confirmed' | 'pending' | 'ignored' | string;
  notes?: string | null;
}

export interface OperationInputTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: RemoteId;
  field_operation_id: RemoteId;
  input_type: string;
  product_name: string;
  active_ingredient?: string | null;
  dose?: number | null;
  dose_unit?: string | null;
  total_volume?: number | null;
  notes?: string | null;
}

export interface PlantOccurrenceTable extends RemoteTimestamps, RemoteSyncMetadata {
  id: RemoteId;
  plant_id: RemoteId;
  occurrence_type_id: RemoteId;
  field_operation_id?: RemoteId | null;
  observed_at: TimestampString;
  severity?: string | null;
  status: 'open' | 'resolved' | 'ignored' | string;
  notes?: string | null;
  annotation_latitude?: number | null;
  annotation_longitude?: number | null;
  gps_accuracy_m?: number | null;
  assigned_distance_meters?: number | null;
  assignment_method?: string | null;
  assignment_status?: string | null;
  resolved_at?: TimestampString | null;
}

export interface InspectionTargetTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: RemoteId;
  field_operation_id: RemoteId;
  plant_id: RemoteId;
  occurrence_type_id?: RemoteId | null;
  route_order?: number | null;
  status: 'pending' | 'visited' | 'skipped' | string;
  distance_from_previous_meters?: number | null;
  visited_at?: TimestampString | null;
  notes?: string | null;
}

export interface InspectionRouteTable extends Pick<RemoteTimestamps, 'created_at'>, RemoteSyncMetadata {
  id: RemoteId;
  field_operation_id: RemoteId;
  route?: JsonString | null;
  distance_meters?: number | null;
}
