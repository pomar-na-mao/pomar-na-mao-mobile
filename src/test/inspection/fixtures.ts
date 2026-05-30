import type {
  InspectionFilter,
  InspectionFilterOptions,
  InspectionListItem,
  InspectionPlant,
  InspectionPlantOccurrence,
  InspectionPlantRow,
  LocalInspection,
  LocalInspectionChange,
  LocalInspectionLoadedPlant,
  SyncInspectionPayload,
  SyncManualInspectionResult,
} from '@/domain/models/inspection';
import type { LocationObject } from 'expo-location';
import type { PostgrestError } from '@supabase/supabase-js';

export const inspectionOccurrence: InspectionPlantOccurrence = {
  code: 'PST',
  name: 'Praga',
  occurrenceTypeId: 'occurrence-1',
  observedAt: '2026-05-30T12:00:00.000Z',
  severity: 'alta',
  status: 'open',
};

export const inspectionPlant: InspectionPlant = {
  distanceMeters: null,
  isChanged: false,
  isNearest: false,
  latitude: -23.1,
  longitude: -46.1,
  occurrences: [inspectionOccurrence],
  plantId: 'plant-1',
  varietyId: 10,
  varietyName: 'Gala',
  zoneId: 'zone-1',
  zoneName: 'Talhao 1',
};

export const secondInspectionPlant: InspectionPlant = {
  ...inspectionPlant,
  latitude: -23.1002,
  longitude: -46.1002,
  occurrences: [],
  plantId: 'plant-2',
};

export const inspectionFilter: InspectionFilter = {
  occurrenceCode: 'PST',
  occurrenceName: 'Praga',
  occurrenceTypeId: 'occurrence-1',
  zoneId: 'zone-1',
  zoneName: 'Talhao 1',
};

export const inspectionFilterOptions: InspectionFilterOptions = {
  occurrenceTypes: [{ code: 'PST', id: 'occurrence-1', name: 'Praga' }],
  varieties: [{ description: 'Maca Gala', id: 10, name: 'Gala' }],
  zones: [{ description: 'Area 1', id: 'zone-1', name: 'Talhao 1' }],
};

export const inspectionLocation: LocationObject = {
  coords: {
    accuracy: 3,
    altitude: 0,
    altitudeAccuracy: 1,
    heading: 45,
    latitude: -23.10001,
    longitude: -46.10001,
    speed: 1.1,
  },
  timestamp: 1_785_000_000_000,
};

export const localInspection: LocalInspection = {
  created_at: '2026-05-30T12:00:00.000Z',
  current_latitude: null,
  current_longitude: null,
  finished_at: null,
  id: 'inspection-1',
  nearest_distance_meters: null,
  nearest_plant_id: null,
  occurrence_code: inspectionFilter.occurrenceCode,
  occurrence_name: inspectionFilter.occurrenceName,
  occurrence_type_id: inspectionFilter.occurrenceTypeId,
  plants_changed_count: 0,
  plants_loaded_count: 2,
  remote_field_operation_id: null,
  started_at: '2026-05-30T12:00:00.000Z',
  status: 'in_progress',
  sync_error: null,
  sync_status: 'pending',
  synced_at: null,
  updated_at: '2026-05-30T12:00:00.000Z',
  zone_id: inspectionFilter.zoneId,
  zone_name: inspectionFilter.zoneName,
};

export const inspectionListItem: InspectionListItem = {
  finishedAt: null,
  id: localInspection.id,
  occurrenceName: localInspection.occurrence_name,
  plantsChangedCount: 0,
  plantsLoadedCount: 2,
  startedAt: localInspection.started_at,
  status: 'in_progress',
  syncStatus: 'pending',
  zoneName: localInspection.zone_name,
};

export const inspectionPlantRow: InspectionPlantRow = {
  latitude: inspectionPlant.latitude,
  longitude: inspectionPlant.longitude,
  occurrence_code: inspectionOccurrence.code,
  occurrence_name: inspectionOccurrence.name,
  occurrence_observed_at: inspectionOccurrence.observedAt,
  occurrence_severity: inspectionOccurrence.severity,
  occurrence_status: inspectionOccurrence.status,
  occurrence_type_id: inspectionOccurrence.occurrenceTypeId,
  plant_id: inspectionPlant.plantId,
  variety_id: inspectionPlant.varietyId,
  variety_name: inspectionPlant.varietyName,
  zone_id: inspectionPlant.zoneId,
  zone_name: inspectionPlant.zoneName,
};

export const localLoadedPlant: LocalInspectionLoadedPlant = {
  created_at: localInspection.created_at,
  distance_meters: 4.2,
  id: `${localInspection.id}:${inspectionPlant.plantId}`,
  inspection_local_id: localInspection.id,
  is_changed: 1,
  is_nearest: 1,
  latitude: inspectionPlant.latitude,
  longitude: inspectionPlant.longitude,
  occurrences_json: JSON.stringify([inspectionOccurrence]),
  plant_id: inspectionPlant.plantId,
  updated_at: localInspection.updated_at,
  variety_id: inspectionPlant.varietyId,
  variety_name: inspectionPlant.varietyName,
  zone_id: inspectionPlant.zoneId,
  zone_name: inspectionPlant.zoneName,
};

export const localInspectionChange: LocalInspectionChange = {
  change_type: 'add_occurrence',
  changed_at: '2026-05-30T12:03:00.000Z',
  distance_to_plant_meters: 4.2,
  gps_accuracy_m: 3,
  id: 'change-1',
  inspection_local_id: localInspection.id,
  latitude: inspectionLocation.coords.latitude,
  longitude: inspectionLocation.coords.longitude,
  new_value_json: JSON.stringify({ name: inspectionOccurrence.name }),
  notes: 'folhas afetadas',
  occurrence_code: inspectionOccurrence.code,
  occurrence_name: inspectionOccurrence.name,
  occurrence_type_id: inspectionOccurrence.occurrenceTypeId,
  plant_id: inspectionPlant.plantId,
  previous_value_json: null,
  remote_occurrence_id: null,
  severity: 'alta',
  sync_error: null,
  sync_status: 'pending',
};

export const syncInspectionPayload: SyncInspectionPayload = {
  deviceId: 'device-1',
  finishedAt: null,
  localInspectionId: localInspection.id,
  occurrenceTypeId: localInspection.occurrence_type_id,
  plantsChanged: [
    {
      changes: [
        {
          changedAt: localInspectionChange.changed_at,
          changeType: localInspectionChange.change_type,
          distanceToPlantMeters: localInspectionChange.distance_to_plant_meters,
          gpsAccuracyM: localInspectionChange.gps_accuracy_m,
          latitude: localInspectionChange.latitude,
          localChangeId: localInspectionChange.id,
          longitude: localInspectionChange.longitude,
          newValue: { name: inspectionOccurrence.name },
          notes: localInspectionChange.notes,
          occurrenceTypeId: localInspectionChange.occurrence_type_id,
          previousValue: undefined,
          severity: localInspectionChange.severity,
        },
      ],
      plantId: localInspectionChange.plant_id,
    },
  ],
  startedAt: localInspection.started_at,
  zoneId: localInspection.zone_id,
};

export const syncManualInspectionResult: SyncManualInspectionResult = {
  created_occurrences_count: 1,
  field_operation_id: 'field-operation-1',
  resolved_occurrences_count: 0,
  updated_occurrences_count: 0,
};

export function createPostgrestError(message: string): PostgrestError {
  return {
    code: 'PGRST_TEST',
    details: 'Test error',
    hint: 'Test hint',
    message,
    name: 'PostgrestError',
  };
}
