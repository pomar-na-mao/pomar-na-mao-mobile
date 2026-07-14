import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePlantMapVisualization } from './use-plant-map-visualization';

const plants = [{ plantId: 'plant-1', latitude: -23, longitude: -49 }];

describe('usePlantMapVisualization', () => {
  it('adopts the first valid region when location becomes ready asynchronously', async () => {
    const { result, rerender } = renderHook<
      ReturnType<typeof usePlantMapVisualization>,
      { isReady: boolean; latitude: number }
    >(
      ({ isReady, latitude }) =>
        usePlantMapVisualization(
          plants,
          { latitude, longitude: isReady ? -49 : 0, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          null,
          isReady,
        ),
      { initialProps: { isReady: false, latitude: 0 } },
    );

    expect(result.current.diagnostics.candidateCount).toBe(0);
    act(() => rerender({ isReady: true, latitude: -23 }));

    await waitFor(() => expect(result.current.diagnostics.candidateCount).toBe(1));
  });

  it('resets the region when the plant collection changes to a different area', async () => {
    const { result, rerender } = renderHook<
      ReturnType<typeof usePlantMapVisualization>,
      {
        plants: typeof plants;
        region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
      }
    >(({ plants, region }) => usePlantMapVisualization(plants, region, null, true), {
      initialProps: {
        plants,
        region: { latitude: -23, longitude: -49, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      },
    });

    expect(result.current.diagnostics.candidateCount).toBe(1);

    act(() =>
      result.current.onRegionChangeComplete({
        latitude: -20,
        longitude: -40,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }),
    );
    expect(result.current.diagnostics.candidateCount).toBe(0);

    const distantPlants = [{ plantId: 'plant-2', latitude: -22, longitude: -48 }];
    act(() =>
      rerender({
        plants: distantPlants,
        region: { latitude: -22, longitude: -48, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      }),
    );

    await waitFor(() => expect(result.current.diagnostics.candidateCount).toBe(1));
  });
});
