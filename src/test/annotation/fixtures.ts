import type {
  AnnotationOccurrenceTypeOption,
  LocalAnnotationOccurrence,
  LocalAnnotationOperation,
  SyncAnnotationPayload,
  SyncAnnotationResult,
} from '@/domain/models/annotation';
import type { LocationObject } from 'expo-location';

export const annotationOccurrenceType: AnnotationOccurrenceTypeOption = {
  code: 'PST',
  id: 'occurrence-1',
  name: 'Praga',
};

export const annotationLocation: LocationObject = {
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

export const localAnnotationOperation: LocalAnnotationOperation = {
  created_at: '2026-06-04T12:00:00.000Z',
  device_id: 'device-1',
  finished_at: null,
  id: 'operation-1',
  local_id: 'operation-1',
  notes: null,
  operation_type_code: 'occurrence_annotation',
  operation_type_id: null,
  remote_field_operation_id: null,
  source: 'manual',
  started_at: '2026-06-04T12:00:00.000Z',
  sync_error: null,
  sync_status: 'pending',
  synced_at: null,
  title: 'Anotação de ocorrência',
  updated_at: '2026-06-04T12:00:00.000Z',
  zone_id: null,
};

export const localAnnotationOccurrence: LocalAnnotationOccurrence = {
  annotation_latitude: annotationLocation.coords.latitude,
  annotation_longitude: annotationLocation.coords.longitude,
  assigned_distance_meters: null,
  assignment_method: null,
  assignment_status: 'pending_review',
  created_at: '2026-06-04T12:01:00.000Z',
  device_id: 'device-1',
  field_operation_id: localAnnotationOperation.id,
  gps_accuracy_m: annotationLocation.coords.accuracy,
  id: 'annotation-1',
  local_id: 'annotation-1',
  notes: 'folhas afetadas',
  observed_at: '2026-06-04T12:01:00.000Z',
  occurrence_code: annotationOccurrenceType.code,
  occurrence_name: annotationOccurrenceType.name,
  occurrence_type_id: annotationOccurrenceType.id,
  plant_id: null,
  remote_occurrence_id: null,
  severity: 'high',
  status: 'open',
  sync_error: null,
  sync_status: 'pending',
  synced_at: null,
  updated_at: '2026-06-04T12:01:00.000Z',
};

export const syncAnnotationPayload: SyncAnnotationPayload = {
  assignedDistanceMeters: localAnnotationOccurrence.assigned_distance_meters,
  assignmentMethod: localAnnotationOccurrence.assignment_method,
  assignmentStatus: localAnnotationOccurrence.assignment_status,
  deviceId: localAnnotationOccurrence.device_id,
  gpsAccuracyM: localAnnotationOccurrence.gps_accuracy_m,
  latitude: localAnnotationOccurrence.annotation_latitude,
  localAnnotationId: localAnnotationOccurrence.local_id ?? localAnnotationOccurrence.id,
  localOperationId: localAnnotationOccurrence.field_operation_id,
  longitude: localAnnotationOccurrence.annotation_longitude,
  notes: localAnnotationOccurrence.notes,
  observedAt: localAnnotationOccurrence.observed_at,
  occurrenceTypeId: localAnnotationOccurrence.occurrence_type_id,
  plantId: localAnnotationOccurrence.plant_id,
  severity: localAnnotationOccurrence.severity,
};

export const syncAnnotationResult: SyncAnnotationResult = {
  field_operation_id: 'remote-operation-1',
  occurrence_id: 'remote-occurrence-1',
  plant_id: 'remote-plant-1',
};
