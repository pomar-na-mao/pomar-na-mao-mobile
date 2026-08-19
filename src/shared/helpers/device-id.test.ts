import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { getPersistentDeviceId, resetPersistentDeviceIdMemoForTests } from './device-id';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'generated-device') }));

describe('persistent device id', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetPersistentDeviceIdMemoForTests();
    (Constants as { installationId?: string | null }).installationId = null;
    jest.clearAllMocks();
  });

  it('generates and persists one id across app-process memo resets', async () => {
    await expect(getPersistentDeviceId()).resolves.toBe('generated-device');
    resetPersistentDeviceIdMemoForTests();
    await expect(getPersistentDeviceId()).resolves.toBe('generated-device');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('prefers a stable installation id when available', async () => {
    (Constants as { installationId?: string | null }).installationId = 'installation-device';
    await expect(getPersistentDeviceId()).resolves.toBe('installation-device');
    expect(randomUUID).not.toHaveBeenCalled();
  });
});
