import type { RoutineFilter } from '@/domain/models/routine/routine-search.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import * as Location from 'expo-location';
import { create } from 'zustand';

interface RoutineStore {
  routineFilters: RoutineFilter | null;
  setRoutineFilters: (filters: RoutineFilter | null) => void;

  searchPlantsData: PlantData[];
  setSearchPlantsData: (plantsData: PlantData[]) => void;

  nearestPlant: PlantData | null;
  setNearestPlant: (nearestPlant: PlantData | null) => void;

  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
}

export const useRoutineStore = create<RoutineStore>((set) => ({
  routineFilters: null,
  setRoutineFilters: (routineFilters) => set(() => ({ routineFilters })),

  searchPlantsData: [],
  setSearchPlantsData: (searchPlantsData) => set(() => ({ searchPlantsData })),

  nearestPlant: null,
  setNearestPlant: (nearestPlant) => set((state) => (state.nearestPlant === nearestPlant ? state : { nearestPlant })),

  location: null,
  setLocation: (location) => set(() => ({ location })),
}));
