export type SprayingLifecycleStatus =
  | 'draft'
  | 'tracking'
  | 'finished'
  | 'simulated'
  | 'reviewed'
  | 'syncing'
  | 'synced'
  | 'sync_error';

export type SprayingSyncStatus = 'pending_create' | 'syncing' | 'synced' | 'sync_error';
export type SprayingCandidateReviewStatus = 'candidate' | 'confirmed' | 'removed' | 'manually_added';
export type SprayingMatchSource = 'auto_matched' | 'manual_added';

export interface SprayingZoneOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface SprayingInputDraft {
  inputType: string;
  productName: string;
  activeIngredient?: string | null;
  dose?: number | null;
  doseUnit?: string | null;
  totalQuantity?: number | null;
  totalQuantityUnit?: string | null;
  notes?: string | null;
}

export interface SprayingSetup {
  zoneId: string;
  zoneName: string;
  title?: string | null;
  operatorName: string;
  machineName: string;
  tractorIdentifier?: string | null;
  notes?: string | null;
  minDistanceMeters: number;
  maxDistanceMeters: number;
  inputs: SprayingInputDraft[];
}

export interface LocalSprayingOperation {
  id: string;
  local_id: string;
  operation_type_code: 'spraying';
  zone_id: string;
  zone_name: string;
  title?: string | null;
  source: 'gps_track';
  started_at: string;
  finished_at?: string | null;
  operator_name: string;
  machine_name: string;
  tractor_identifier?: string | null;
  notes?: string | null;
  lifecycle_status: SprayingLifecycleStatus;
  review_status: string;
  min_distance_meters: number;
  max_distance_meters: number;
  candidate_plants_count: number;
  confirmed_plants_count: number;
  device_id: string;
  sync_status: SprayingSyncStatus;
  remote_field_operation_id?: string | null;
  synced_at?: string | null;
  sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalSprayingTrackPoint {
  id: string;
  local_id: string;
  field_operation_local_id: string;
  recorded_at: string;
  latitude: number;
  longitude: number;
  speed_mps?: number | null;
  accuracy_m?: number | null;
  device_id: string;
  sync_status: SprayingSyncStatus;
  remote_track_point_id?: number | null;
  sync_error?: string | null;
  created_at: string;
}

export interface SprayingLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface LocalSprayingRoute {
  id: string;
  local_id: string;
  field_operation_local_id: string;
  route_geojson: string;
  distance_meters: number;
  started_at: string;
  finished_at: string;
  device_id: string;
  sync_status: SprayingSyncStatus;
  remote_route_id?: string | null;
  sync_error?: string | null;
  created_at: string;
}

export interface LocalSprayingInput {
  id: string;
  local_id: string;
  field_operation_local_id: string;
  input_type: string;
  product_name: string;
  active_ingredient?: string | null;
  dose?: number | null;
  dose_unit?: string | null;
  total_quantity?: number | null;
  total_quantity_unit?: string | null;
  notes?: string | null;
  device_id: string;
  sync_status: SprayingSyncStatus;
  remote_input_id?: string | null;
  sync_error?: string | null;
  created_at: string;
}

export interface SprayingPlant {
  plantId: string;
  latitude: number;
  longitude: number;
  zoneId?: string | null;
  zoneName?: string | null;
  varietyId?: number | null;
  varietyName?: string | null;
  reviewStatus?: SprayingCandidateReviewStatus | null;
  matchSource?: SprayingMatchSource | null;
  distanceMeters?: number | null;
}

export interface LocalSprayingCandidatePlant {
  id: string;
  local_id: string;
  field_operation_local_id: string;
  plant_id: string;
  plant_local_id?: string | null;
  nearest_track_point_local_id?: string | null;
  matched_at?: string | null;
  distance_meters?: number | null;
  match_source: SprayingMatchSource;
  review_status: SprayingCandidateReviewStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalSprayingConfirmedPlant {
  id: string;
  local_id: string;
  field_operation_local_id: string;
  plant_id: string;
  plant_local_id?: string | null;
  nearest_track_point_local_id?: string | null;
  matched_at?: string | null;
  distance_meters?: number | null;
  match_source: SprayingMatchSource;
  status: 'confirmed';
  notes?: string | null;
  device_id: string;
  sync_status: SprayingSyncStatus;
  remote_history_id?: string | null;
  sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SprayingSummary {
  trackPoints: number;
  routeDistanceMeters: number;
  candidatePlants: number;
  confirmedPlants: number;
}

export interface SprayingAggregate {
  operation: LocalSprayingOperation;
  trackPoints: LocalSprayingTrackPoint[];
  route: LocalSprayingRoute | null;
  inputs: LocalSprayingInput[];
  plants: SprayingPlant[];
  candidates: LocalSprayingCandidatePlant[];
  confirmedPlants: LocalSprayingConfirmedPlant[];
  summary: SprayingSummary;
}

export interface SprayingSimulationMatch {
  plantId: string;
  distanceMeters: number;
  nearestTrackPointLocalId?: string | null;
  matchedAt?: string | null;
}

export interface SyncReviewedSprayingPayload {
  localOperationId: string;
  deviceId: string;
  operation: {
    zoneId: string;
    title?: string | null;
    source: 'gps_track';
    startedAt: string;
    finishedAt: string;
    operatorName: string;
    machineName: string;
    tractorIdentifier?: string | null;
    notes?: string | null;
    minDistanceMeters: number;
    maxDistanceMeters: number;
  };
  trackPoints: {
    localId: string;
    recordedAt: string;
    latitude: number;
    longitude: number;
    speedMps?: number | null;
    accuracyM?: number | null;
  }[];
  route: {
    localId: string;
    geojson: SprayingLineString;
    distanceMeters: number;
    startedAt: string;
    finishedAt: string;
  };
  inputs: {
    localId: string;
    inputType: string;
    productName: string;
    activeIngredient?: string | null;
    dose?: number | null;
    doseUnit?: string | null;
    totalQuantity?: number | null;
    totalQuantityUnit?: string | null;
    notes?: string | null;
  }[];
  confirmedPlants: {
    localId: string;
    plantId: string;
    nearestTrackPointLocalId?: string | null;
    matchedAt?: string | null;
    distanceMeters?: number | null;
    matchSource: SprayingMatchSource;
    notes?: string | null;
  }[];
}

export interface SyncReviewedSprayingResult {
  field_operation_id: string;
  route_id?: string | null;
  track_points_count: number;
  inputs_count: number;
  confirmed_plants_count: number;
  synced_at?: string | null;
}
