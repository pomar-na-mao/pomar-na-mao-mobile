import { Point } from './geolocation-math';

export const getPolygonCentroid = (points: Point[]): Point | null => {
  if (points.length === 0) {
    return null;
  }

  let latitudeSum = 0;
  let longitudeSum = 0;

  for (const point of points) {
    latitudeSum += point.latitude;
    longitudeSum += point.longitude;
  }

  return {
    latitude: latitudeSum / points.length,
    longitude: longitudeSum / points.length,
  };
};
