import type { SprayingZoneOption } from '@/domain/models/spraying';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPRAYING_LOADED_ZONE_KEY = '@pomar-na-mao/spraying/loaded-zone';

export async function getLoadedSprayingZone(): Promise<SprayingZoneOption | null> {
  const rawValue = await AsyncStorage.getItem(SPRAYING_LOADED_ZONE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const value = JSON.parse(rawValue) as Partial<SprayingZoneOption>;
    if (!value.id || !value.name) {
      throw new Error('Invalid loaded spraying zone data.');
    }

    return {
      id: value.id,
      name: value.name,
      description: value.description ?? null,
    };
  } catch {
    await clearLoadedSprayingZone();
    return null;
  }
}

export async function saveLoadedSprayingZone(zone: SprayingZoneOption): Promise<void> {
  await AsyncStorage.setItem(
    SPRAYING_LOADED_ZONE_KEY,
    JSON.stringify({
      id: zone.id,
      name: zone.name,
      description: zone.description ?? null,
    } satisfies SprayingZoneOption),
  );
}

export async function clearLoadedSprayingZone(): Promise<void> {
  await AsyncStorage.removeItem(SPRAYING_LOADED_ZONE_KEY);
}
