import type { OccurrencesRouteFilter } from '@/domain/models/occurrences-route/occurrences-route-search.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import * as Location from 'expo-location';
import { create } from 'zustand';

interface OccurrencesRouteStore {
  occurrencesRouteFilters: OccurrencesRouteFilter | null;
  setOccurrencesRouteFilters: (filters: OccurrencesRouteFilter | null) => void;

  searchPlantsData: PlantData[];
  setSearchPlantsData: (plantsData: PlantData[]) => void;

  nearestPlant: PlantData | null;
  setNearestPlant: (nearestPlant: PlantData | null) => void;

  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
}

export const useOccurrencesRouteStore = create<OccurrencesRouteStore>((set) => ({
  occurrencesRouteFilters: null,
  setOccurrencesRouteFilters: (occurrencesRouteFilters) => set(() => ({ occurrencesRouteFilters })),

  searchPlantsData: [],
  setSearchPlantsData: (searchPlantsData) => set(() => ({ searchPlantsData })),

  nearestPlant: null,
  setNearestPlant: (nearestPlant) => set((state) => (state.nearestPlant === nearestPlant ? state : { nearestPlant })),

  location: null,
  setLocation: (location) => set(() => ({ location })),
}));
