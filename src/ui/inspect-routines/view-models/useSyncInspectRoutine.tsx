import { inspectRoutinesRepository } from '@/data/repositories/inspect-routines/inspect-routines-repository';
import { useInspectRoutinesSyncStore } from '@/data/store/inspect-routines/use-inspect-routines-sync-store';
import type { InspectRoutinesSyncFilter } from '@/domain/models/inspect-routines/inspect-routines-sync.schema';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import React, { createContext, useContext, useEffect } from 'react';

interface SyncInspectRoutineContextProps {
  searchInspectRoutineFromFilters: (inspectRoutinesSyncSearchFilters: InspectRoutinesSyncFilter) => Promise<void>;
}

const SyncInspectRoutineContext = createContext({} as SyncInspectRoutineContextProps);

export const SyncInspectRoutineProvider = ({ children }: { children: React.ReactNode }) => {
  const { setMessage, setIsVisible } = useAlertBoxStore();

  const { setIsLoading } = useLoadingStore();

  const { setRoutines, inspectRoutinesSyncSearchFilters } = useInspectRoutinesSyncStore((state) => state);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (mounted) {
          const { data: routines } = await inspectRoutinesRepository.findAll(inspectRoutinesSyncSearchFilters);
          if (routines) {
            setRoutines(routines);
          }
        }
      } catch (error) {
        setMessage('Erro ao carregar rotinas. Tente novamente.\n' + error);
        setIsVisible(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function searchInspectRoutineFromFilters(
    inspectRoutinesSyncSearchFilters: InspectRoutinesSyncFilter,
  ): Promise<void> {
    setIsLoading(true);

    const { data: routines } = await inspectRoutinesRepository.findAll(inspectRoutinesSyncSearchFilters);

    if (routines) {
      setRoutines(routines);
    }

    setIsLoading(false);
  }

  return (
    <SyncInspectRoutineContext.Provider value={{ searchInspectRoutineFromFilters }}>
      {children}
    </SyncInspectRoutineContext.Provider>
  );
};

export const useSyncInspectRoutine = () => useContext(SyncInspectRoutineContext);
