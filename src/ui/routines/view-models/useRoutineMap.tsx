import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { useRoutineSqliteService } from '@/data/services/routine/use-routine-sqlite-service';
import { useRoutineStore } from '@/data/store/routine/use-routine-store';
import type { RoutineFilter } from '@/domain/models/routine/routine-search.schema';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { detectNearestPlantWithDistance } from '@/utils/geolocation/geolocation-math';
import React, { createContext, useContext, useEffect } from 'react';

interface RoutineMapContextProps {
  loadPlantsByFilters(filters: RoutineFilter | null): Promise<void>;
}

const RoutineMapContext = createContext({} as RoutineMapContextProps);

export const RoutineMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { setSearchPlantsData, location, setNearestPlant } = useRoutineStore((state) => state);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const routineSqliteService = useRoutineSqliteService();

  useEffect(() => {
    async function loadSavedPlants() {
      setIsLoading(true);
      try {
        const locallyUpdatedPlants = await routineSqliteService.searchAll();
        if (locallyUpdatedPlants && locallyUpdatedPlants.length > 0) {
          setSearchPlantsData(locallyUpdatedPlants);
        }
      } catch (error) {
        console.error('Erro ao carregar plantas salvas localmente:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedPlants();
  }, []);

  async function loadPlantsByFilters(filters: RoutineFilter | null): Promise<void> {
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
        const locallyUpdatedPlants = await routineSqliteService.searchAll();
        const locallyUpdatedPlantsById = new Map(locallyUpdatedPlants.map((plant) => [plant.id, plant]));

        const normalizedPlantsData = data.map(
          (item) => locallyUpdatedPlantsById.get(item.id) ?? { ...item, wasUpdated: false },
        );

        await routineSqliteService.replaceAll(normalizedPlantsData);
        setSearchPlantsData(normalizedPlantsData);

        if (location) {
          const detection = detectNearestPlantWithDistance(location, normalizedPlantsData);
          setNearestPlant(detection?.plant ?? null);
        } else {
          setNearestPlant(null);
        }

        return;
      }

      await routineSqliteService.clearAll();
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

  return <RoutineMapContext.Provider value={{ loadPlantsByFilters }}>{children}</RoutineMapContext.Provider>;
};

export const useRoutineMap = () => useContext(RoutineMapContext);
