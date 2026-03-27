import { inspectAnnotationRepository } from '@/data/repositories/inspect-annotation/inspect-annotation-repository';
import { inspectsRepository } from '@/data/repositories/inspects/inspects-repository';
import { useInspectAnnotationsSyncStore } from '@/data/store/inspect-annotation/use-inspect-annotation-sync-store';
import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import React, { createContext, useContext, useEffect } from 'react';

interface SyncInspectAnnotationContextProps {
  loadAnnotations: () => Promise<void>;
  handleSyncAnnotation: (annotation: SupabaseInspectAnnotation) => void;
}

const SyncInspectAnnotationContext = createContext({} as SyncInspectAnnotationContextProps);

export const SyncInspectAnnotationProvider = ({ children }: { children: React.ReactNode }) => {
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const { setAnnotations } = useInspectAnnotationsSyncStore((state) => state);

  const loadAnnotations = async () => {
    setIsLoading(true);
    try {
      const { data: annotations } = await inspectAnnotationRepository.findAll();
      if (annotations) {
        setAnnotations(annotations);
      }
    } catch (error) {
      setMessage('Erro ao carregar anotações. Tente novamente.\n' + error);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAnnotation = async (annotation: SupabaseInspectAnnotation) => {
    if (!annotation.id) return;

    setIsLoading(true);
    const { error } = await inspectsRepository.approveInspectAnnotation(annotation.id);

    setIsLoading(false);
    if (error) {
      console.log(error);
      setMessage('Erro ao aprovar anotação e atualizar a planta.');
      setIsVisible(true);
      return;
    }

    setMessage('Planta atualizada com sucesso!');
    setIsVisible(true);
    await loadAnnotations();
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (mounted) {
          const { data: annotations } = await inspectAnnotationRepository.findAll();
          if (annotations) {
            setAnnotations(annotations);
          }
        }
      } catch (error) {
        setMessage('Erro ao carregar anotações. Tente novamente.\n' + error);
        setIsVisible(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SyncInspectAnnotationContext.Provider value={{ loadAnnotations, handleSyncAnnotation }}>
      {children}
    </SyncInspectAnnotationContext.Provider>
  );
};

export const useSyncInspectAnnotation = () => useContext(SyncInspectAnnotationContext);
