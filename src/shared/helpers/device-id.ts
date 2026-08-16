import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';

const DEVICE_ID_KEY = '@pomar-na-mao/device-id';
let pendingDeviceId: Promise<string> | null = null;

async function resolveDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored?.trim()) return stored;

  const installationId = Constants.installationId?.trim();
  const deviceId = installationId || randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function getPersistentDeviceId(): Promise<string> {
  pendingDeviceId ??= resolveDeviceId().catch((error) => {
    pendingDeviceId = null;
    throw error;
  });
  return pendingDeviceId;
}

export function resetPersistentDeviceIdMemoForTests() {
  pendingDeviceId = null;
}
