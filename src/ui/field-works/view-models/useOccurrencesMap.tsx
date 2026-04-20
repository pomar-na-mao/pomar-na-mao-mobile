import { useOccurrencesRouteStore } from '@/data/store/occurrences-route/use-occurrences-route-store';
import type { OccurrencesRouteFilter } from '@/domain/models/occurrences-route/occurrences-route-search.schema';
import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { detectNearestPlantWithDistance } from '@/utils/geolocation/geolocation-math';
import React, { createContext, useContext } from 'react';

interface OccurrencesMapContextProps {
  loadPlantsByFilters(filters: OccurrencesRouteFilter | null): Promise<void>;
}

const OccurrencesMapContext = createContext({} as OccurrencesMapContextProps);

export const OccurrencesMapProvider = ({ children }: { children: React.ReactNode }) => {
  const { setSearchPlantsData, location, setNearestPlant } = useOccurrencesRouteStore((state) => state);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  async function loadPlantsByFilters(filters: OccurrencesRouteFilter | null): Promise<void> {
    setIsLoading(true);

    const { data, error } = await plantsRepository.findAll(filters);

    if (error) {
      setSearchPlantsData([]);
      setNearestPlant(null);
      setMessage(error.message);
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    if (data && data?.length > 0) {
      const normalizedPlantsData = data.map((item) => ({ ...item, wasUpdated: false }));
      setSearchPlantsData(normalizedPlantsData);

      if (location) {
        const detection = detectNearestPlantWithDistance(location, normalizedPlantsData);
        setNearestPlant(detection?.plant ?? null);
      } else {
        setNearestPlant(null);
      }

      setIsLoading(false);
    } else {
      setSearchPlantsData([]);
      setNearestPlant(null);
      setMessage('Nenhuma planta encontrada para os filtros selecionados.\nAjuste os filtros e tente novamente!');
      setIsVisible(true);
      setIsLoading(false);
    }
  }

  return <OccurrencesMapContext.Provider value={{ loadPlantsByFilters }}>{children}</OccurrencesMapContext.Provider>;
};

export const useOccurrencesMap = () => useContext(OccurrencesMapContext);
