import type { WorkRoutineFilter } from '@/domain/models/work-routine/work-routine-search.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import * as Location from 'expo-location';
import { create } from 'zustand';

interface WorkRoutineStore {
  workRoutineFilters: WorkRoutineFilter | null;
  setWorkRoutineFilters: (filters: WorkRoutineFilter | null) => void;

  searchPlantsData: PlantData[];
  setSearchPlantsData: (plantsData: PlantData[]) => void;

  nearestPlant: PlantData | null;
  setNearestPlant: (nearestPlant: PlantData | null) => void;

  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
}

export const useWorkRoutineStore = create<WorkRoutineStore>((set) => ({
  workRoutineFilters: null,
  setWorkRoutineFilters: (workRoutineFilters) => set(() => ({ workRoutineFilters })),

  searchPlantsData: [],
  setSearchPlantsData: (searchPlantsData) => set(() => ({ searchPlantsData })),

  nearestPlant: null,
  setNearestPlant: (nearestPlant) => set((state) => (state.nearestPlant === nearestPlant ? state : { nearestPlant })),

  location: null,
  setLocation: (location) => set(() => ({ location })),
}));
