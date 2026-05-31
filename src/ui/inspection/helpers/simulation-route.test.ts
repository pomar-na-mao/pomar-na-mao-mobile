import {
  buildSimulationRoute,
  createSimulationLocation,
  EMPTY_SIMULATION_POINTS,
  SIMULATION_LOCATION_INTERVAL_MS,
} from './simulation-route';

describe('simulation-route helpers', () => {
  it('returns an empty route until all simulation points are selected', () => {
    expect(buildSimulationRoute(EMPTY_SIMULATION_POINTS)).toEqual([]);
    expect(
      buildSimulationRoute([{ latitude: -23.1, longitude: -46.1 }, { latitude: -23.1001, longitude: -46.1001 }, null]),
    ).toEqual([]);
  });

  it('builds an interpolated route preserving first and last points', () => {
    const firstPoint = { latitude: -23.1, longitude: -46.1 };
    const secondPoint = { latitude: -23.10003, longitude: -46.10003 };
    const thirdPoint = { latitude: -23.10006, longitude: -46.10006 };

    const route = buildSimulationRoute([firstPoint, secondPoint, thirdPoint]);

    expect(route.length).toBeGreaterThan(3);
    expect(route[0]).toEqual(firstPoint);
    expect(route[route.length - 1]).toEqual(thirdPoint);
    expect(route).toContainEqual(secondPoint);
  });

  it('creates a location object with walking simulation metadata', () => {
    const timestamp = 1_785_000_000_000;
    const location = createSimulationLocation(
      { latitude: -23.1, longitude: -46.1 },
      { latitude: -23.1001, longitude: -46.1001 },
      timestamp + SIMULATION_LOCATION_INTERVAL_MS,
    );

    expect(location.timestamp).toBe(timestamp + SIMULATION_LOCATION_INTERVAL_MS);
    expect(location.coords.latitude).toBe(-23.1);
    expect(location.coords.longitude).toBe(-46.1);
    expect(location.coords.accuracy).toBe(1);
    expect(location.coords.speed).toBe(1.2);
    expect(location.coords.heading).toBeGreaterThanOrEqual(0);
    expect(location.coords.heading).toBeLessThan(360);
  });
});
