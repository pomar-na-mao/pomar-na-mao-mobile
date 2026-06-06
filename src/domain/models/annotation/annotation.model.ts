import type { LocationObject } from 'expo-location';

export type AnnotationOperationStatus = 'in_progress' | 'finished' | 'synced' | 'sync_error';
export type AnnotationSyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type AnnotationAssignmentMethod = 'nearest_plant' | 'manual';
export type AnnotationAssignmentStatus = 'pending_review' | 'confirmed';

export interface AnnotationOccurrenceTypeOption {
  id: string;
  code: string;
  name: string;
}

export interface AnnotationZoneOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface LocalAnnotationOperation {
  id: string;
  local_id?: string | null;
  operation_type_id?: string | null;
  operation_type_code?: string | null;
  zone_id?: string | null;
  title?: string | null;
  source: string;
  started_at: string;
  finished_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  sync_status: AnnotationSyncStatus;
  device_id?: string | null;
  remote_field_operation_id?: string | null;
  synced_at?: string | null;
  sync_error?: string | null;
}

export interface LocalAnnotationOccurrence {
  id: string;
  local_id?: string | null;
  plant_id?: string | null;
  occurrence_type_id: string;
  occurrence_code?: string | null;
  occurrence_name?: string | null;
  field_operation_id?: string | null;
  observed_at: string;
  severity?: string | null;
  status: string;
  notes?: string | null;
  annotation_latitude: number;
  annotation_longitude: number;
  gps_accuracy_m?: number | null;
  assigned_distance_meters?: number | null;
  assignment_method?: AnnotationAssignmentMethod | string | null;
  assignment_status?: AnnotationAssignmentStatus | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  sync_status: AnnotationSyncStatus;
  device_id?: string | null;
  remote_occurrence_id?: string | null;
  synced_at?: string | null;
  sync_error?: string | null;
}

export interface AnnotationRecord {
  operation: LocalAnnotationOperation | null;
  occurrence: LocalAnnotationOccurrence;
}

export interface AnnotationSummary {
  total: number;
  pending: number;
  synced: number;
  error: number;
}

export interface AnnotationFormData {
  occurrenceTypeId: string;
  occurrenceCode: string;
  occurrenceName: string;
  severity?: string | null;
  notes?: string | null;
}

export interface CreateAnnotationParams {
  occurrence: AnnotationOccurrenceTypeOption;
  location: LocationObject;
  severity?: string | null;
  notes?: string | null;
  deviceId: string;
}

export interface SyncAnnotationPayload {
  localAnnotationId: string;
  localOperationId?: string | null;
  plantId?: string | null;
  occurrenceTypeId: string;
  latitude: number;
  longitude: number;
  gpsAccuracyM?: number | null;
  assignedDistanceMeters?: number | null;
  assignmentMethod?: string | null;
  assignmentStatus?: string | null;
  severity?: string | null;
  notes?: string | null;
  observedAt: string;
  deviceId?: string | null;
}

export interface SyncAnnotationResult {
  field_operation_id?: string | null;
  occurrence_id?: string | null;
  plant_id?: string | null;
}

export interface AnnotationState {
  currentLocation: LocationObject | null;
  initialRegion: LocationObject['coords'] | null;
  annotations: AnnotationRecord[];
  summary: AnnotationSummary;
  occurrenceTypes: AnnotationOccurrenceTypeOption[];
  zones: AnnotationZoneOption[];
  activeOperation: LocalAnnotationOperation | null;
  isAnnotationModalVisible: boolean;
}
