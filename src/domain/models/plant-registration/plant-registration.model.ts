import { z } from 'zod';

export const plantRegistrationFormSchema = z.object({
  latitude: z.number().min(-90, 'Latitude inválida.').max(90, 'Latitude inválida.'),
  longitude: z.number().min(-180, 'Longitude inválida.').max(180, 'Longitude inválida.'),
  plantingDate: z.string().datetime({ message: 'Informe a data de plantio.' }),
  varietyId: z.number().int().positive('Selecione uma variedade.'),
  zoneId: z.string().min(1, 'Selecione uma zona.'),
});

export type PlantRegistrationFormValues = z.infer<typeof plantRegistrationFormSchema>;
export type PlantRegistrationSyncStatus = 'pending_create' | 'syncing' | 'synced' | 'error';
export type PlantRecordOrigin = 'remote_cache' | 'local_registration';

export interface PlantRegistrationOption {
  id: string | number;
  name: string;
  description?: string | null;
}

export interface LocalPlantRegistration {
  id: string;
  local_id: string;
  remote_plant_id?: string | null;
  latitude: number;
  longitude: number;
  gps_accuracy_m?: number | null;
  gps_timestamp?: number | null;
  variety_id: number;
  variety_name?: string | null;
  zone_id: string;
  zone_name?: string | null;
  planting_date: string;
  is_dead: 0;
  is_new: 1;
  non_existent: 0;
  created_at: string;
  updated_at: string;
  sync_status: PlantRegistrationSyncStatus;
  device_id: string;
  sync_error?: string | null;
  synced_at?: string | null;
  record_origin: 'local_registration';
}

export interface CreatePlantRegistrationParams extends PlantRegistrationFormValues {
  gpsAccuracyM: number;
  gpsTimestamp: number;
  varietyName: string;
  zoneName: string;
}

export interface SyncNewPlantPayload {
  localId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  gpsAccuracyM: number | null;
  gpsTimestamp: number | null;
  varietyId: number;
  zoneId: string;
  plantingDate: string;
}

export interface SyncNewPlantResult {
  plant_id: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export function toSyncNewPlantPayload(registration: LocalPlantRegistration): SyncNewPlantPayload {
  return {
    localId: registration.local_id,
    deviceId: registration.device_id,
    latitude: registration.latitude,
    longitude: registration.longitude,
    gpsAccuracyM: registration.gps_accuracy_m ?? null,
    gpsTimestamp: registration.gps_timestamp ?? null,
    varietyId: registration.variety_id,
    zoneId: registration.zone_id,
    plantingDate: registration.planting_date,
  };
}
