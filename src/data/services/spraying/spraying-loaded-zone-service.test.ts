import { clearLoadedSprayingZone, getLoadedSprayingZone, saveLoadedSprayingZone } from './spraying-loaded-zone-service';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
}));

describe('spraying loaded zone service', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  it('persists and reads the last loaded zone', async () => {
    await saveLoadedSprayingZone({ id: 'zone-1', name: 'Talhao 1' });

    await expect(getLoadedSprayingZone()).resolves.toEqual({
      id: 'zone-1',
      name: 'Talhao 1',
      description: null,
    });
  });

  it('clears the loaded zone', async () => {
    await saveLoadedSprayingZone({ id: 'zone-1', name: 'Talhao 1' });

    await clearLoadedSprayingZone();

    await expect(getLoadedSprayingZone()).resolves.toBeNull();
  });

  it('removes invalid persisted data', async () => {
    mockStorage.set('@pomar-na-mao/spraying/loaded-zone', JSON.stringify({ id: 'zone-1' }));

    await expect(getLoadedSprayingZone()).resolves.toBeNull();
    expect(mockStorage.has('@pomar-na-mao/spraying/loaded-zone')).toBe(false);
  });
});
