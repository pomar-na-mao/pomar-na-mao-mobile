import type { InspectRoutineFilter } from '@/domain/models/inspect-routines/inspect-routines-search.schema';
import type { SqliteRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import * as Location from 'expo-location';

import { create } from 'zustand';

interface InspectRoutinesStore {
  inspectRoutineSearchFilters: InspectRoutineFilter | null;
  setInspectRoutineSearchFilters: (filters: InspectRoutineFilter | null) => void;

  searchPlantsData: PlantData[];
  setSearchPlantsData: (plantsData: PlantData[]) => void;

  nearestPlant: PlantData | null;
  setNearestPlant: (nearestPlant: PlantData | null) => void;

  selectedInspection: SqliteRoutine | null;
  setSelectedInspection: (selectedInspection: SqliteRoutine | null) => void;

  routines: SqliteRoutine[];
  setRoutines: (routines: SqliteRoutine[]) => void;

  routinesType: 'updated' | 'not-updated';
  setRoutinesType: (routinesType: 'updated' | 'not-updated') => void;

  isDetecting: boolean;
  setIsDetecting: (isDetecting: boolean) => void;

  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
}

export const useInspectRoutinesStore = create<InspectRoutinesStore>((set) => ({
  inspectRoutineSearchFilters: null,
  setInspectRoutineSearchFilters: (inspectRoutineSearchFilters) => set(() => ({ inspectRoutineSearchFilters })),

  searchPlantsData: [],
  setSearchPlantsData: (searchPlantsData) => set(() => ({ searchPlantsData })),

  nearestPlant: null,
  setNearestPlant: (nearestPlant) => set((state) => (state.nearestPlant === nearestPlant ? state : { nearestPlant })),

  selectedInspection: null,
  setSelectedInspection: (selectedInspection) => set(() => ({ selectedInspection })),

  routines: [],
  setRoutines: (routines) => set(() => ({ routines })),

  routinesType: 'updated',
  setRoutinesType: (routinesType) => set(() => ({ routinesType })),

  isDetecting: true,
  setIsDetecting: (isDetecting) => set(() => ({ isDetecting })),

  location: null,
  setLocation: (location) => set(() => ({ location })),
}));
