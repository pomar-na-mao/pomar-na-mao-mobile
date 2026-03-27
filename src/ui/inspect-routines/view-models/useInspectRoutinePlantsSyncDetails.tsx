import { inspectRoutinesPlantsRepository } from '@/data/repositories/inspect-routines-plants/inspect-routines-plants-repository';
import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { useInspectRoutinesPlantsSyncDetailsStore } from '@/data/store/inspect-routines/use-inspect-routines-plants-sync-details-store';
import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { occurenceKeys } from '@/shared/constants/values';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import type { PostgrestError } from '@supabase/supabase-js';
import { useLocalSearchParams } from 'expo-router';
import React, { createContext, useContext, useEffect } from 'react';

interface InspectRoutinePlantsSyncDetailsContextProps {
  searchPlantDetailHandler: (plantId: string) => Promise<{ data: PlantData | null; error: PostgrestError | null }>;
  syncPlantDataHandler(plantWithUpdates: RoutinePlants): Promise<void>;
}

const InspectRoutinePlantsSyncDetailsContext = createContext({} as InspectRoutinePlantsSyncDetailsContextProps);

export const InspectRoutinePlantsSyncDetailsProvider = ({ children }: { children: React.ReactNode }) => {
  const { id } = useLocalSearchParams();

  const { setIsLoading } = useLoadingStore();

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const { setInspectRoutinePlants } = useInspectRoutinesPlantsSyncDetailsStore();

  async function findInspectRoutinesPlants(id: string): Promise<void> {
    try {
      const { data: routines } = await inspectRoutinesPlantsRepository.findAllByRoutineId(id.toString());

      if (routines) {
        const routinePlants = routines as RoutinePlants[];
        setInspectRoutinePlants(routinePlants);
      }
    } catch {
      setMessage('Erro ao carregar plantas desta rotina. Tente novamente.\n');
      setIsVisible(true);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) await findInspectRoutinesPlants(id.toString());
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function searchPlantDetailHandler(
    plantId: string,
  ): Promise<{ data: PlantData | null; error: PostgrestError | null }> {
    return await plantsRepository.findById(plantId);
  }

  async function syncPlantDataHandler(plantWithUpdates: RoutinePlants): Promise<void> {
    setIsLoading(true);

    const informations = {
      region: plantWithUpdates.region,
      variety: plantWithUpdates.variety,
      mass: plantWithUpdates.mass,
      life_of_the_tree: plantWithUpdates.life_of_the_tree,
      harvest: plantWithUpdates.harvest,
      planting_date: plantWithUpdates.planting_date,
      description: plantWithUpdates.description,
    } as Partial<PlantData>;

    const occurrences = Object.fromEntries(occurenceKeys.map((key) => [key, plantWithUpdates[key]]));

    const plantId = plantWithUpdates?.plant_id;

    const inspectRoutinePlantId = plantWithUpdates.id;

    const { error } = await inspectRoutinesPlantsRepository.updatePlantFromInspectRoutine(
      plantId,
      occurrences,
      inspectRoutinePlantId,
      informations,
    );

    if (error) {
      setIsVisible(true);
      setMessage(`Erro ao sincronizar mudanças!\n${error.message}`);
    } else {
      await findInspectRoutinesPlants(id.toString());
      setIsVisible(true);
      setMessage('Mudanças sincronizadas com sucesso!');
    }

    setIsLoading(false);
  }

  return (
    <InspectRoutinePlantsSyncDetailsContext.Provider value={{ searchPlantDetailHandler, syncPlantDataHandler }}>
      {children}
    </InspectRoutinePlantsSyncDetailsContext.Provider>
  );
};

export const useInspectRoutinePlantsSyncDetails = () => useContext(InspectRoutinePlantsSyncDetailsContext);
