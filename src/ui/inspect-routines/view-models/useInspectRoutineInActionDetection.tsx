import { useInspectRoutineSqliteService } from '@/data/services/inspect-routines/use-inspect-routines-sqlite-service';
import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import type { PlantInformation } from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { SqliteRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';

import type { BooleanKeys, PlantData } from '@/domain/models/shared/plant-data.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { wasPlantUpdatedCheck } from '@/utils/plant-data/compare';
import { useLocalSearchParams } from 'expo-router';
import React, { createContext, useContext, useEffect } from 'react';

interface InspectRoutineInActionDetectionContextProps {
  updatePlantOccurrencesHandler: (formState: Record<BooleanKeys, boolean>) => Promise<void>;
  updatePlantInformationHandler: (plantInformationData: PlantInformation) => Promise<void>;
}

const InspectRoutineInActionDetectionContext = createContext({} as InspectRoutineInActionDetectionContextProps);

export const InspectRoutineInActionDetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { id } = useLocalSearchParams();

  const routineDatabase = useInspectRoutineSqliteService();

  const { setIsLoading } = useLoadingStore();

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const { setRoutines, nearestPlant, setNearestPlant, selectedInspection, setSelectedInspection } =
    useInspectRoutinesStore();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    (async () => {
      try {
        const result = await routineDatabase.findById(Number(id));

        if (result && mounted) {
          setSelectedInspection(result);
        }
      } catch (error) {
        setMessage('Erro ao carregar rotina. Tente novamente.\n' + error);
        setIsVisible(true);
      }

      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function updatePlantInformationHandler(plantInformationData: PlantInformation): Promise<void> {
    setIsLoading(true);

    const updatedPlantData = {
      ...nearestPlant,
      variety: plantInformationData.variety,
      planting_date: plantInformationData.plantingDate.toISOString(),
      mass: plantInformationData.mass,
      life_of_the_tree: plantInformationData.lifeOfTree,
      harvest: plantInformationData.harvest,
      description: plantInformationData.description,
    } as PlantData;

    const selectedInspectionPlantData = JSON.parse(selectedInspection?.plant_data as string) as PlantData[];

    // Mark updated plant with wasUpdated true, keeping the original array order.
    const wasUpdatedSearchPlantsData = { ...updatedPlantData, wasUpdated: true };

    const newInspectionPlants = selectedInspectionPlantData.map((plant) =>
      plant.id === nearestPlant?.id ? wasUpdatedSearchPlantsData : plant,
    );

    const inspectionRoutineId = selectedInspection?.id as number;

    await routineDatabase.updateRoutinePlantData(inspectionRoutineId, newInspectionPlants as PlantData[]);

    const updatedRoutines = (await routineDatabase.searchAllPendingRoutines()) as SqliteRoutine[];

    const updatedSelectedInspection = updatedRoutines.find(
      (routine) => routine.id === inspectionRoutineId,
    ) as SqliteRoutine;

    setRoutines(updatedRoutines);

    setSelectedInspection(updatedSelectedInspection);

    setNearestPlant(wasUpdatedSearchPlantsData);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  async function updatePlantOccurrencesHandler(formState: Record<BooleanKeys, boolean>): Promise<void> {
    setIsLoading(true);
    // Verificar se a planta teve dados alterados
    const wasPlantUpdated = wasPlantUpdatedCheck(nearestPlant as PlantData, formState as PlantData);

    if (!wasPlantUpdated) {
      setIsLoading(false);
      return;
    }

    const updatedPlantData = {
      ...nearestPlant,
      ...formState,
    } as PlantData;

    const selectedInspectionPlantData = JSON.parse(selectedInspection?.plant_data as string) as PlantData[];

    // Mark updated plant with wasUpdated true, keeping the original array order.
    const wasUpdatedSearchPlantsData = { ...updatedPlantData, wasUpdated: true };

    const newInspectionPlants = selectedInspectionPlantData.map((plant) =>
      plant.id === nearestPlant?.id ? wasUpdatedSearchPlantsData : plant,
    );

    const inspectionRoutineId = selectedInspection?.id as number;

    await routineDatabase.updateRoutinePlantData(inspectionRoutineId, newInspectionPlants as PlantData[]);

    const updatedRoutines = (await routineDatabase.searchAllPendingRoutines()) as SqliteRoutine[];

    const updatedSelectedInspection = updatedRoutines.find(
      (routine) => routine.id === inspectionRoutineId,
    ) as SqliteRoutine;

    setRoutines(updatedRoutines);

    setSelectedInspection(updatedSelectedInspection);

    setNearestPlant(wasUpdatedSearchPlantsData);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <InspectRoutineInActionDetectionContext.Provider
      value={{ updatePlantOccurrencesHandler, updatePlantInformationHandler }}
    >
      {children}
    </InspectRoutineInActionDetectionContext.Provider>
  );
};

export const useInspectRoutineInActionDetection = () => useContext(InspectRoutineInActionDetectionContext);
