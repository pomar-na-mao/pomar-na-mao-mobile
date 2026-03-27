import { inspectsRepository } from '@/data/repositories/inspects/inspects-repository';
import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { useInspectRoutineSqliteService } from '@/data/services/inspect-routines/use-inspect-routines-sqlite-service';
import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import type { SqliteRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import * as Network from 'expo-network';
import React, { createContext, useContext, useEffect } from 'react';

interface InspectRoutineContextProps {
  resetSearchPlantData: () => Promise<void>;
  deleteRoutineListHandle: (selectedRoutineId: number | null) => Promise<void>;
  sendRoutineListHandle: (selectedRoutineId: number | null) => Promise<void>;
  generateNewInspectRoutine(): Promise<void>;
}

const InspectRoutineContext = createContext({} as InspectRoutineContextProps);

export const InspectRoutineProvider = ({ children }: { children: React.ReactNode }) => {
  const { inspectRoutineSearchFilters, setInspectRoutineSearchFilters, setSearchPlantsData } = useInspectRoutinesStore(
    (state) => state,
  );

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const { setIsLoading } = useLoadingStore();

  const { routines, setRoutines } = useInspectRoutinesStore((state) => state);

  const inspectRoutineSqliteService = useInspectRoutineSqliteService();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    (async () => {
      if (mounted) {
        try {
          const routines = await inspectRoutineSqliteService.searchAllRoutines();

          if (routines) {
            setRoutines(routines);
          }
        } catch (error) {
          setMessage('Erro ao carregar rotinas. Tente novamente.\n' + error);
          setIsVisible(true);
        }
      }

      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function generateNewInspectRoutine(): Promise<void> {
    setIsLoading(true);

    const { data, error } = await plantsRepository.findAll(inspectRoutineSearchFilters);

    if (error) {
      setSearchPlantsData([]);
      setMessage(error.message);
      setIsVisible(true);
      setIsLoading(false);
      return;
    } else {
      if (data && data?.length > 0) {
        const wasNotUpdatedSearchPlantsData = data.map((item) => ({ ...item, wasUpdated: false }));

        setSearchPlantsData(wasNotUpdatedSearchPlantsData);

        const routine = {
          date: new Date().toISOString(),
          region: inspectRoutineSearchFilters?.region,
          plant_data: wasNotUpdatedSearchPlantsData,
          is_done: 0,
        } as SqliteRoutine;

        try {
          await inspectRoutineSqliteService.create(routine);

          const updatedList = await inspectRoutineSqliteService.searchAllPendingRoutines();
          if (updatedList) {
            setRoutines(updatedList);
          }

          setMessage('Rotina criada com sucesso.');
          setIsVisible(true);
          resetSearchPlantData();
          setIsLoading(false);
        } catch (error) {
          setMessage('Erro ao salvar rotina. Tente novamente.\n' + error);
          setIsVisible(true);
        }
      } else {
        setMessage('Nenhuma planta encontrada para os filtros selecionados.\n Ajuste os filtros e tente novamente!');
        setIsVisible(true);
        setIsLoading(false);
        return;
      }
    }
  }

  async function deleteRoutineListHandle(selectedRoutineId: number | null): Promise<void> {
    setIsLoading(true);

    if (selectedRoutineId) {
      try {
        await inspectRoutineSqliteService.removeRoutine(selectedRoutineId);
      } catch (error) {
        setMessage('Erro ao excluir rotina. Tente novamente.\n' + error);
        setIsVisible(true);
      }

      const updatedList = await inspectRoutineSqliteService.searchAllPendingRoutines();
      if (updatedList) {
        setRoutines(updatedList);
      }
      setIsLoading(false);
    }
  }

  async function sendRoutineListHandle(selectedRoutineId: number | null): Promise<void> {
    if (!selectedRoutineId) return;

    setIsLoading(true);

    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;

    if (!isConnected) {
      setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId);

    if (!selectedRoutine) {
      setMessage('Rotina não encontrada. Tente novamente.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    const newInspectRoutinePlantsData = JSON.parse(selectedRoutine.plant_data as string) as PlantData[];

    const wasUpdatedPlants = newInspectRoutinePlantsData.filter((plant) => plant.wasUpdated);

    if (wasUpdatedPlants.length === 0) {
      setMessage('Nenhuma planta foi atualizada. Faça ao menos uma atualização para enviar a rotina.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    const newInspectRoutine = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: '',
      date: selectedRoutine.date,
      region: selectedRoutine.region,
    };

    const enrichedPlantData = wasUpdatedPlants.map((plant) => ({
      plant_id: plant.id,
      latitude: plant.latitude,
      longitude: plant.longitude,
      gps_timestamp: plant.gps_timestamp,
      mass: plant.mass,
      variety: plant.variety,
      harvest: plant.harvest,
      description: plant.description,
      planting_date: plant.planting_date,
      life_of_the_tree: plant.life_of_the_tree,
      stick: plant.stick,
      broken_branch: plant.broken_branch,
      vine_growing: plant.vine_growing,
      burnt_branch: plant.burnt_branch,
      struck_by_lightning: plant.struck_by_lightning,
      drill: plant.drill,
      anthill: plant.anthill,
      in_experiment: plant.in_experiment,
      weeds_in_the_basin: plant.weeds_in_the_basin,
      fertilization_or_manuring: plant.fertilization_or_manuring,
      mites: plant.mites,
      thrips: plant.thrips,
      empty_collection_box_near: plant.empty_collection_box_near,
      is_dead: plant.is_dead,
      region: plant.region,
      is_new: plant.is_new,
      non_existent: plant.non_existent,
      frost: plant.frost,
      flowers: plant.flowers,
      buds: plant.buds,
      dehydrated: plant.dehydrated,
      is_approved: false,
    }));

    const { error: rpcError } = await inspectsRepository.createANewInspectRoutineWithPlants(
      newInspectRoutine,
      enrichedPlantData as Partial<PlantData>[],
    );

    if (rpcError) {
      setMessage('Erro ao enviar rotina. Tente novamente.\n' + rpcError.message);
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    await inspectRoutineSqliteService.removeRoutine(selectedRoutineId);

    const updatedList = await inspectRoutineSqliteService.searchAllRoutines();

    if (updatedList) {
      setRoutines(updatedList);
    }

    setMessage('Rotina enviada com sucesso.');
    setIsVisible(true);
    setIsLoading(false);
  }

  async function resetSearchPlantData(): Promise<void> {
    setSearchPlantsData([]);
    setInspectRoutineSearchFilters({ region: null, occurrence: null });
  }

  return (
    <InspectRoutineContext.Provider
      value={{
        resetSearchPlantData,
        deleteRoutineListHandle,
        sendRoutineListHandle,
        generateNewInspectRoutine,
      }}
    >
      {children}
    </InspectRoutineContext.Provider>
  );
};

export const useInspectRoutine = () => useContext(InspectRoutineContext);
