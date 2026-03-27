export interface PlantData {
  wasUpdated: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  longitude: number;
  latitude: number;
  gps_timestamp: number;
  photo_file: File | null | string;
  mass: string;
  variety: string;
  harvest: string;
  description: string;
  planting_date: string;
  life_of_the_tree: string;
  stick: boolean;
  broken_branch: boolean;
  vine_growing: boolean;
  burnt_branch: boolean;
  struck_by_lightning: boolean;
  drill: boolean;
  anthill: boolean;
  in_experiment: boolean;
  weeds_in_the_basin: boolean;
  fertilization_or_manuring: boolean;
  mites: boolean;
  thrips: boolean;
  region: string;
  empty_collection_box_near: boolean;
  is_dead: boolean;
  is_new: boolean;
  non_existent: boolean;
  frost: boolean;
  flowers: boolean;
  buds: boolean;
  dehydrated: boolean;
}

export interface Position {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface PlantsMarker {
  id: string;
  latitude: number;
  longitude: number;
}

export interface PlantsMarkerWithWasUpdatedInfo extends PlantsMarker {
  wasUpdated: boolean;
}

export type BooleanKeys = {
  [K in keyof PlantData]: PlantData[K] extends boolean ? K : never;
}[keyof PlantData];
