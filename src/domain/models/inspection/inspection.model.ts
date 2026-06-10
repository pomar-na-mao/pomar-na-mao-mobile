import type { LocationObject } from 'expo-location';

export type InspectionStatus = 'in_progress' | 'finished' | 'synced' | 'sync_error';
export type InspectionSyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type InspectionChangeType = 'add_occurrence' | 'remove_occurrence';

export interface ZoneOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface OccurrenceTypeOption {
  id: string;
  code: string;
  name: string;
}

export interface VarietyOption {
  id: number;
  name: string;
  description?: string | null;
}

export interface InspectionFilter {
  zoneId?: string | null;
  zoneName?: string | null;
  occurrenceTypeId?: string | null;
  occurrenceCode?: string | null;
  occurrenceName?: string | null;
}

export interface InspectionPlantOccurrence {
  occurrenceTypeId: string;
  code: string;
  name: string;
  status: string;
  severity?: string | null;
  observedAt?: string | null;
}

export interface InspectionPlant {
  plantId: string;
  latitude: number;
  longitude: number;
  zoneId?: string | null;
  zoneName?: string | null;
  varietyId?: number | null;
  varietyName?: string | null;
  occurrences: InspectionPlantOccurrence[];
  isNearest: boolean;
  isChanged: boolean;
  distanceMeters?: number | null;
}

export interface InspectionPlantRow {
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_id?: string | null;
  zone_name?: string | null;
  variety_id?: number | null;
  variety_name?: string | null;
  occurrence_type_id?: string | null;
  occurrence_code?: string | null;
  occurrence_name?: string | null;
  occurrence_status?: string | null;
  occurrence_severity?: string | null;
  occurrence_observed_at?: string | null;
}

export interface LocalInspection {
  id: string;
  zone_id?: string | null;
  zone_name?: string | null;
  occurrence_type_id?: string | null;
  occurrence_code?: string | null;
  occurrence_name?: string | null;
  status: InspectionStatus;
  sync_status: InspectionSyncStatus;
  started_at: string;
  finished_at?: string | null;
  plants_loaded_count: number;
  plants_changed_count: number;
  current_latitude?: number | null;
  current_longitude?: number | null;
  nearest_plant_id?: string | null;
  nearest_distance_meters?: number | null;
  created_at: string;
  updated_at: string;
  remote_field_operation_id?: string | null;
  synced_at?: string | null;
  sync_error?: string | null;
}

export interface LocalInspectionLoadedPlant {
  id: string;
  inspection_local_id: string;
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_id?: string | null;
  zone_name?: string | null;
  variety_id?: number | null;
  variety_name?: string | null;
  occurrences_json: string;
  is_nearest: 0 | 1;
  is_changed: 0 | 1;
  distance_meters?: number | null;
  created_at: string;
  updated_at: string;
}

export interface LocalInspectionChange {
  id: string;
  inspection_local_id: string;
  plant_id: string;
  change_type: InspectionChangeType;
  occurrence_type_id: string;
  occurrence_code: string;
  occurrence_name: string;
  previous_value_json?: string | null;
  new_value_json?: string | null;
  severity?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gps_accuracy_m?: number | null;
  distance_to_plant_meters?: number | null;
  changed_at: string;
  sync_status: InspectionSyncStatus;
  remote_occurrence_id?: string | null;
  sync_error?: string | null;
}

export interface InspectionListItem {
  id: string;
  startedAt: string;
  finishedAt?: string | null;
  zoneName?: string | null;
  occurrenceName?: string | null;
  plantsLoadedCount: number;
  plantsChangedCount: number;
  status: InspectionStatus;
  syncStatus: InspectionSyncStatus;
}

export interface NearestPlantState {
  inspectionLocalId: string;
  plantId: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  detectedAt: string;
}

export interface InspectionFilterOptions {
  zones: ZoneOption[];
  occurrenceTypes: OccurrenceTypeOption[];
  varieties: VarietyOption[];
}

export interface SyncInspectionPayload {
  localInspectionId: string;
  zoneId?: string | null;
  occurrenceTypeId?: string | null;
  startedAt: string;
  finishedAt?: string | null;
  deviceId: string;
  plantsChanged: {
    plantId: string;
    changes: {
      localChangeId: string;
      changeType: InspectionChangeType;
      occurrenceTypeId: string;
      severity?: string | null;
      notes?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      gpsAccuracyM?: number | null;
      distanceToPlantMeters?: number | null;
      changedAt: string;
      previousValue?: unknown;
      newValue?: unknown;
    }[];
  }[];
}

export interface SyncManualInspectionResult {
  field_operation_id: string;
  created_occurrences_count: number;
  updated_occurrences_count: number;
  resolved_occurrences_count: number;
}

export interface InspectionState {
  currentLocation: LocationObject | null;
  activeInspection: LocalInspection | null;
  loadedPlants: InspectionPlant[];
  nearestPlant: InspectionPlant | null;
  inspections: InspectionListItem[];
  filters: InspectionFilter | null;
  filterOptions: InspectionFilterOptions;
  isFilterModalVisible: boolean;
  isNearestPlantModalVisible: boolean;
}
