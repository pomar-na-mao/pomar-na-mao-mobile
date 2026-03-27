import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import { create } from 'zustand';

interface InspectRoutinesPlantsSyncDetailsStore {
  inspectRoutinePlants: RoutinePlants[];
  setInspectRoutinePlants: (inspectRoutinePlants: RoutinePlants[]) => void;

  currentPlant: RoutinePlants | null;
  setCurrentPlant: (currentPlant: RoutinePlants) => void;
}

export const useInspectRoutinesPlantsSyncDetailsStore = create<InspectRoutinesPlantsSyncDetailsStore>((set) => ({
  inspectRoutinePlants: [],
  setInspectRoutinePlants: (inspectRoutinePlants) => set(() => ({ inspectRoutinePlants })),

  currentPlant: null,
  setCurrentPlant: (currentPlant) => set(() => ({ currentPlant })),
}));
