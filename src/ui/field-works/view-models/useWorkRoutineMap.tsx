import { useWorkRoutineSqliteService } from '@/data/services/work-routine/use-work-routine-sqlite-service';
import { useWorkRoutineStore } from '@/data/store/work-routine/use-work-routine-store';
import type { WorkRoutineFilter } from '@/domain/models/work-routine/work-routine-search.schema';
import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { detectNearestPlantWithDistance } from '@/utils/geolocation/geolocation-math';
import React, { createContext, useContext } from 'react';

interface WorkRoutineMapContextProps {
  loadPlantsByFilters(filters: WorkRoutineFilter | null): Promise<void>;
}

const WorkRoutineMapContext = createContext({} as WorkRoutineMapContextProps);

export const WorkRoutineMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { setSearchPlantsData, location, setNearestPlant } = useWorkRoutineStore((state) => state);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const workRoutineSqliteService = useWorkRoutineSqliteService();

  async function loadPlantsByFilters(filters: WorkRoutineFilter | null): Promise<void> {
    setIsLoading(true);

    try {
      const { data, error } = await plantsRepository.findAll(filters);

      if (error) {
        setSearchPlantsData([]);
        setNearestPlant(null);
        setMessage(error.message);
        setIsVisible(true);
        return;
      }

      if (data && data.length > 0) {
        const locallyUpdatedPlants = await workRoutineSqliteService.searchAll();
        const locallyUpdatedPlantsById = new Map(locallyUpdatedPlants.map((plant) => [plant.id, plant]));

        const normalizedPlantsData = data.map(
          (item) => locallyUpdatedPlantsById.get(item.id) ?? { ...item, wasUpdated: false },
        );

        await workRoutineSqliteService.replaceAll(normalizedPlantsData);
        setSearchPlantsData(normalizedPlantsData);

        if (location) {
          const detection = detectNearestPlantWithDistance(location, normalizedPlantsData);
          setNearestPlant(detection?.plant ?? null);
        } else {
          setNearestPlant(null);
        }

        return;
      }

      await workRoutineSqliteService.clearAll();
      setSearchPlantsData([]);
      setNearestPlant(null);
      setMessage('Nenhuma planta encontrada para os filtros selecionados.\nAjuste os filtros e tente novamente!');
      setIsVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSearchPlantsData([]);
      setNearestPlant(null);
      setMessage('Erro ao atualizar a base local da rotina de trabalho.\n' + message);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  return <WorkRoutineMapContext.Provider value={{ loadPlantsByFilters }}>{children}</WorkRoutineMapContext.Provider>;
};

export const useWorkRoutineMap = () => useContext(WorkRoutineMapContext);
