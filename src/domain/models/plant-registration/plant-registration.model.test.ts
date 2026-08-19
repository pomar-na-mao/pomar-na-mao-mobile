import { plantRegistrationFormSchema, toSyncNewPlantPayload, type LocalPlantRegistration } from '.';

const registration: LocalPlantRegistration = {
  id: 'local-1',
  local_id: 'local-1',
  remote_plant_id: null,
  latitude: -23.5,
  longitude: -46.6,
  variety_id: 7,
  variety_name: 'Gala',
  zone_id: 'zone-1',
  zone_name: 'Norte',
  planting_date: '2026-08-12T12:00:00.000Z',
  is_dead: 0,
  is_new: 1,
  non_existent: 0,
  created_at: '2026-08-12T12:01:00.000Z',
  updated_at: '2026-08-12T12:01:00.000Z',
  sync_status: 'pending_create',
  device_id: 'device-1',
  record_origin: 'local_registration',
};

describe('plant registration model', () => {
  it('validates required coordinates and structural ids', () => {
    expect(
      plantRegistrationFormSchema.safeParse({
        latitude: -23.5,
        longitude: -46.6,
        plantingDate: registration.planting_date,
        varietyId: 7,
        zoneId: 'zone-1',
      }).success,
    ).toBe(true);
    expect(
      plantRegistrationFormSchema.safeParse({
        latitude: 91,
        longitude: -46.6,
        plantingDate: '',
        varietyId: 0,
        zoneId: '',
      }).success,
    ).toBe(false);
  });

  it('maps every remote sync field without UI labels', () => {
    expect(toSyncNewPlantPayload(registration)).toEqual({
      localId: 'local-1',
      deviceId: 'device-1',
      gpsAccuracyM: null,
      gpsTimestamp: null,
      latitude: -23.5,
      longitude: -46.6,
      varietyId: 7,
      zoneId: 'zone-1',
      plantingDate: registration.planting_date,
    });
  });
});
