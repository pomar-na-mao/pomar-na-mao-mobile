import { buildSimulationRouteSegment } from '@/ui/inspection/helpers/simulation-route';
import type { LatLng } from 'react-native-maps';

export type SprayingSimulationPointIndex = 0 | 1;
export type SprayingSimulationPoints = [LatLng | null, LatLng | null];

export const EMPTY_SPRAYING_SIMULATION_POINTS: SprayingSimulationPoints = [null, null];

export function buildSprayingSimulationRoute(points: SprayingSimulationPoints) {
  const [firstPoint, secondPoint] = points;

  if (!firstPoint || !secondPoint) {
    return [];
  }

  return buildSimulationRouteSegment(firstPoint, secondPoint);
}
