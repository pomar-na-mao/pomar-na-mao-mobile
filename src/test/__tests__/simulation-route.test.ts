import { buildSimulationRoute } from '@/ui/inspection/helpers/simulation-route';

describe('buildSimulationRoute', () => {
  it('returns an empty route until all simulation points are selected', () => {
    const route = buildSimulationRoute([
      { latitude: -23.1, longitude: -46.1 },
      { latitude: -23.2, longitude: -46.2 },
      null,
    ]);

    expect(route).toEqual([]);
  });

  it('builds a route through all selected simulation points', () => {
    const firstPoint = { latitude: -23.1, longitude: -46.1 };
    const secondPoint = { latitude: -23.10001, longitude: -46.10001 };
    const thirdPoint = { latitude: -23.10002, longitude: -46.10002 };

    const route = buildSimulationRoute([firstPoint, secondPoint, thirdPoint]);

    expect(route.length).toBeGreaterThan(2);
    expect(route[0]).toEqual(firstPoint);
    expect(route.at(-1)).toEqual(thirdPoint);
  });
});
