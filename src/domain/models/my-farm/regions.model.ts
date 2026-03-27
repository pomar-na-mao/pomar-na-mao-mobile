export interface RegionVertex {
  id: string;
  created_at: string;
  longitude: number;
  latitude: number;
  region: string;
}

export interface RegionPolygon {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  centroid: {
    latitude: number;
    longitude: number;
  } | null;
}
