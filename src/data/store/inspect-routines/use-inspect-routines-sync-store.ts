import type { InspectRoutinesSyncFilter } from '@/domain/models/inspect-routines/inspect-routines-sync.schema';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import { create } from 'zustand';

interface InspectRoutinesSyncStore {
  routines: SupabaseRoutine[];
  setRoutines: (routines: SupabaseRoutine[]) => void;
  inspectRoutinesSyncSearchFilters: InspectRoutinesSyncFilter | null;
  setInspectRoutinesSyncSearchFilters: (filters: InspectRoutinesSyncFilter | null) => void;
}

export const useInspectRoutinesSyncStore = create<InspectRoutinesSyncStore>((set) => ({
  routines: [],
  setRoutines: (routines) => set(() => ({ routines })),
  inspectRoutinesSyncSearchFilters: null,
  setInspectRoutinesSyncSearchFilters: (inspectRoutinesSyncSearchFilters) =>
    set(() => ({ inspectRoutinesSyncSearchFilters })),
}));
