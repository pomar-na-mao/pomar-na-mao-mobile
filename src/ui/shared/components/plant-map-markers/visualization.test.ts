import type { PlantMapMarkerData } from '.';
import {
  createPlantMapRegion,
  createPlantSpatialIndex,
  PLANT_MAP_MAX_OVERLAYS,
  queryPlantSpatialIndex,
  selectPlantMapVisualization,
  type PlantMapRegion,
} from './visualization';

const region: PlantMapRegion = {
  latitude: -23,
  longitude: -49,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

function createPlants(count: number): PlantMapMarkerData[] {
  return Array.from({ length: count }, (_, index) => ({
    plantId: `plant-${index.toString().padStart(5, '0')}`,
    latitude: -23.045 + (index % 100) * 0.0009,
    longitude: -49.045 + Math.floor(index / 100) * 0.0009,
    isHighlighted: index % 10 === 0,
  }));
}

describe('plant map visualization', () => {
  it('creates a region centered on loaded plants instead of the fallback location', () => {
    const plantA = { plantId: 'a', latitude: -23.2, longitude: -49.2 };
    const plantB = { plantId: 'b', latitude: -23.0, longitude: -49.0 };

    expect(createPlantMapRegion([plantA, plantB], { latitude: 0, longitude: 0 }, 0.002)).toMatchObject({
      latitude: -23.1,
      longitude: -49.1,
    });
  });

  it('rejects invalid coordinates and duplicate IDs', () => {
    const valid = createPlants(1)[0];
    const index = createPlantSpatialIndex([
      valid,
      { ...valid },
      { plantId: 'invalid', latitude: Number.NaN, longitude: -49 },
    ]);

    expect(queryPlantSpatialIndex(index, region)).toEqual([valid]);
  });

  it('queries the viewport with overscan and excludes distant plants', () => {
    const inside = { plantId: 'inside', latitude: -23, longitude: -49 };
    const overscan = { plantId: 'overscan', latitude: -23.055, longitude: -49 };
    const outside = { plantId: 'outside', latitude: -24, longitude: -50 };
    const index = createPlantSpatialIndex([inside, overscan, outside]);

    const visiblePlantIds = queryPlantSpatialIndex(index, region).map((plant) => plant.plantId);
    expect(visiblePlantIds).toHaveLength(2);
    expect(visiblePlantIds).toEqual(expect.arrayContaining(['inside', 'overscan']));
  });

  it('queries across the antimeridian', () => {
    const index = createPlantSpatialIndex([
      { plantId: 'east', latitude: 0, longitude: 179.99 },
      { plantId: 'west', latitude: 0, longitude: -179.99 },
    ]);

    expect(
      queryPlantSpatialIndex(index, {
        latitude: 0,
        longitude: 179.99,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }).map((plant) => plant.plantId),
    ).toEqual(['east', 'west']);
  });

  it.each([1000, 5000, 10000])('keeps %i source plants within the overlay budget', (count) => {
    const index = createPlantSpatialIndex(createPlants(count));
    const result = selectPlantMapVisualization(index, region);
    const representedPlantCount = result.items.reduce(
      (total, item) => total + (item.type === 'cluster' ? item.count : 1),
      0,
    );

    expect(result.diagnostics.sourceCount).toBe(count);
    expect(representedPlantCount).toBe(result.diagnostics.candidateCount);
    expect(result.items.length).toBeLessThanOrEqual(PLANT_MAP_MAX_OVERLAYS);
    expect(result.items.some((item) => item.type === 'cluster')).toBe(true);
  });

  it('produces stable identities and summarizes highlighted plants', () => {
    const index = createPlantSpatialIndex(createPlants(5000));
    const first = selectPlantMapVisualization(index, region);
    const second = selectPlantMapVisualization(index, region);

    expect(second.items.map((item) => item.id)).toEqual(first.items.map((item) => item.id));
    expect(first.items.some((item) => item.type === 'cluster' && item.highlightedCount > 0)).toBe(true);
  });

  it('keeps the in-viewport priority plant individual', () => {
    const plants = createPlants(5000);
    const priorityId = plants[0].plantId;
    const result = selectPlantMapVisualization(createPlantSpatialIndex(plants), region, priorityId);

    expect(result.items[0]).toMatchObject({ id: priorityId, isPriority: true, type: 'plant' });
  });

  it('refreshes visual metadata without rebuilding the coordinate index', () => {
    const plants = createPlants(2).map((plant) => ({ ...plant, isHighlighted: false }));
    const index = createPlantSpatialIndex(plants);
    const updatedPlants = plants.map((plant, index) => ({ ...plant, isHighlighted: index === 0 }));
    const result = selectPlantMapVisualization(index, region, null, updatedPlants);

    expect(
      result.items.some(
        (item) =>
          (item.type === 'plant' && item.plant.isHighlighted) ||
          (item.type === 'cluster' && item.highlightedCount === 1),
      ),
    ).toBe(true);
  });

  it('keeps nearest selection deterministic when equal-distance plants compete', () => {
    const plants = [
      { plantId: 'plant-b', latitude: -23.00001, longitude: -49 },
      { plantId: 'plant-a', latitude: -23.00001, longitude: -49 },
    ];
    const result = selectPlantMapVisualization(
      createPlantSpatialIndex(plants),
      { latitude: -23.00001, longitude: -49, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      'plant-b',
    );

    expect(result.items[0]).toMatchObject({ id: 'plant-b', isPriority: true, type: 'plant' });
  });
});
