import { inspectAnnotationRepository } from '@/data/repositories/inspect-annotation/inspect-annotation-repository';
import { useInspectAnnotationSqliteService } from '@/data/services/inspect-annotation/use-inspect-annotation-sqlite-service';
import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';
import type { PlantInformation } from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { BooleanKeys } from '@/domain/models/shared/plant-data.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import type { PlantAnnotationData } from '@/ui/inspect-annotation/components/inspect-annotation-insert/plant-annotation-form';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import React, { createContext, useContext } from 'react';

interface InspectAnnotationContextProps {
  submitAnnotation: (data: PlantAnnotationData) => Promise<void>;
  sendAnnotations: () => Promise<void>;
  deleteAnnotations: () => Promise<void>;
  pendingCount: number;
}

const InspectAnnotationContext = createContext({} as InspectAnnotationContextProps);

export const InspectAnnotationProvider = ({ children }: { children: React.ReactNode }) => {
  const { create, searchAll, remove } = useInspectAnnotationSqliteService();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const [pendingCount, setPendingCount] = React.useState(0);

  const refreshPendingCount = React.useCallback(async () => {
    const annotations = await searchAll();
    setPendingCount(annotations?.length ?? 0);
  }, [searchAll]);

  React.useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  async function submitAnnotation(data: PlantAnnotationData): Promise<void> {
    setIsLoading(true);

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const result = await create({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        information: data.information,
        occurrences: data.occurrences,
        created_at: new Date().toISOString(),
      });

      setMessage(`Anotação #${result.insertedRowId} realizada com sucesso!`);
      setIsVisible(true);
      await refreshPendingCount();
    } catch {
      setMessage(`Erro ao realizar a anotação!`);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendAnnotations(): Promise<void> {
    setIsLoading(true);

    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;

    if (!isConnected) {
      setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    const annotations = await searchAll();

    if (!annotations || annotations.length === 0) {
      setMessage('Nenhuma anotação pendente para envio.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      const mappedAnnotations: SupabaseInspectAnnotation[] = annotations.map((annotation) => {
        const info: PlantInformation =
          typeof annotation.information === 'string' ? JSON.parse(annotation.information) : annotation.information;

        const occurrences: Partial<Record<BooleanKeys, boolean>> =
          typeof annotation.occurrences === 'string' ? JSON.parse(annotation.occurrences) : annotation.occurrences;

        return {
          latitude: annotation.latitude ?? 0,
          longitude: annotation.longitude ?? 0,
          variety: info.variety ?? null,
          mass: info.mass ?? null,
          life_of_the_tree: info.lifeOfTree ?? null,
          harvest: info.harvest ?? null,
          planting_date: info.plantingDate ? new Date(info.plantingDate).toISOString() : null,
          description: info.description ?? null,
          occurrences,
          created_at: annotation.created_at,
        };
      });

      const { error } = await inspectAnnotationRepository.insert(mappedAnnotations);

      if (error) {
        setMessage('Erro ao enviar as anotações.');
        setIsVisible(true);
      } else {
        for (const annotation of annotations) {
          await remove(annotation.id);
        }

        setMessage('Anotações enviadas com sucesso.');
        setIsVisible(true);
        await refreshPendingCount();
      }
    } catch {
      setMessage('Erro inesperado ao enviar as anotações.');
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteAnnotations(): Promise<void> {
    setIsLoading(true);
    try {
      const annotations = await searchAll();
      if (annotations && annotations.length > 0) {
        for (const a of annotations) {
          await remove(a.id);
        }
        setMessage('Anotações descartadas com sucesso.');
        setIsVisible(true);
      }
      await refreshPendingCount();
    } catch {
      setMessage('Erro ao descartar anotações.');
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <InspectAnnotationContext.Provider value={{ submitAnnotation, sendAnnotations, deleteAnnotations, pendingCount }}>
      {children}
    </InspectAnnotationContext.Provider>
  );
};

export const useInspectAnnotation = () => useContext(InspectAnnotationContext);
