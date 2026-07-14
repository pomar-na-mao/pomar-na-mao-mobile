import type { OccurrenceTypeOption, VarietyOption, ZoneOption } from '@/domain/models/inspection';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheKeys = {
  occurrenceTypes: '@pomar-na-mao/field-work-options/occurrence-types',
  varieties: '@pomar-na-mao/field-work-options/varieties',
  zones: '@pomar-na-mao/field-work-options/zones',
} as const;

async function readArray<T>(key: string): Promise<T[] | null> {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    if (storedValue === null) return null;

    const parsedValue: unknown = JSON.parse(storedValue);
    if (Array.isArray(parsedValue)) return parsedValue as T[];

    await AsyncStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

async function writeArray<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const fieldWorkOptionsCache = {
  async readAll(): Promise<{
    occurrenceTypes: OccurrenceTypeOption[] | null;
    varieties: VarietyOption[] | null;
    zones: ZoneOption[] | null;
  }> {
    const [occurrenceTypes, varieties, zones] = await Promise.all([
      readArray<OccurrenceTypeOption>(cacheKeys.occurrenceTypes),
      readArray<VarietyOption>(cacheKeys.varieties),
      readArray<ZoneOption>(cacheKeys.zones),
    ]);

    return { occurrenceTypes, varieties, zones };
  },
  saveOccurrenceTypes(data: OccurrenceTypeOption[]): Promise<void> {
    return writeArray(cacheKeys.occurrenceTypes, data);
  },
  saveVarieties(data: VarietyOption[]): Promise<void> {
    return writeArray(cacheKeys.varieties, data);
  },
  saveZones(data: ZoneOption[]): Promise<void> {
    return writeArray(cacheKeys.zones, data);
  },
};
