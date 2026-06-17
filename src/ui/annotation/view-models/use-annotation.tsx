import { annotationRepository } from '@/data/repositories/annotation/annotation-repository';
import { useAnnotationSqliteService } from '@/data/services/annotation/use-annotation-sqlite-service';
import type {
  AnnotationOccurrenceTypeOption,
  AnnotationRecord,
  AnnotationSummary,
  AnnotationZoneOption,
  LocalAnnotationOperation,
} from '@/domain/models/annotation';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { getAnnotationDeviceId } from '@/ui/annotation/helpers/device';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface SaveAnnotationParams {
  occurrence: AnnotationOccurrenceTypeOption;
  severity?: string | null;
  notes?: string | null;
}

interface LocationUpdateOptions {
  source?: 'device' | 'simulation';
}

interface AnnotationContextProps {
  currentLocation: Location.LocationObject | null;
  initialRegion: Location.LocationObjectCoords | null;
  activeOperation: LocalAnnotationOperation | null;
  annotations: AnnotationRecord[];
  summary: AnnotationSummary;
  occurrenceTypes: AnnotationOccurrenceTypeOption[];
  zones: AnnotationZoneOption[];
  isAnnotationModalVisible: boolean;
  validationMessage: string | null;
  openAnnotationModal(): void;
  closeAnnotationModal(): void;
  applyLocationUpdate(location: Location.LocationObject, options?: LocationUpdateOptions): void;
  setLocationSimulationActive(isActive: boolean): void;
  saveAnnotation(params: SaveAnnotationParams): Promise<void>;
  finishActiveAnnotationOperation(): Promise<void>;
  syncAnnotations(): Promise<void>;
  clearAnnotations(): Promise<void>;
  refreshAnnotations(): Promise<void>;
}

const emptySummary: AnnotationSummary = {
  error: 0,
  pending: 0,
  synced: 0,
  total: 0,
};

const ANNOTATION_LOCATION_DISTANCE_INTERVAL_METERS = 0;
const ANNOTATION_LOCATION_TIME_INTERVAL_MS = 250;

const AnnotationContext = createContext({} as AnnotationContextProps);

export const AnnotationProvider = ({ children }: { children: React.ReactNode }) => {
  const sqliteService = useAnnotationSqliteService();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [activeOperation, setActiveOperation] = useState<LocalAnnotationOperation | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationRecord[]>([]);
  const [summary, setSummary] = useState<AnnotationSummary>(emptySummary);
  const [occurrenceTypes, setOccurrenceTypes] = useState<AnnotationOccurrenceTypeOption[]>([]);
  const [zones, setZones] = useState<AnnotationZoneOption[]>([]);
  const [isAnnotationModalVisible, setIsAnnotationModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const isLocationSimulationActiveRef = useRef(false);
  const activeOperationRef = useRef<LocalAnnotationOperation | null>(null);
  const latestDeviceLocationRef = useRef<Location.LocationObject | null>(null);

  const initialRegion = useMemo(() => currentLocation?.coords ?? null, [currentLocation]);

  useEffect(() => {
    activeOperationRef.current = activeOperation;
  }, [activeOperation]);

  const refreshAnnotations = useCallback(async () => {
    const [records, nextSummary, operation] = await Promise.all([
      sqliteService.listAnnotations(),
      sqliteService.getSummary(),
      sqliteService.getActiveOperation(),
    ]);

    setAnnotations(records);
    setSummary(nextSummary);
    setActiveOperation(operation);
  }, [sqliteService]);

  const loadOptions = useCallback(async () => {
    const cachedOptions = await sqliteService.getCachedOptions();
    setOccurrenceTypes(cachedOptions.occurrenceTypes);
    setZones(cachedOptions.zones);

    const { data, error } = await annotationRepository.getOptions();

    if (error) {
      if (cachedOptions.occurrenceTypes.length === 0) {
        setMessage('Erro ao carregar dados de anotação.\n' + error.message);
        setIsVisible(true);
      }
      return;
    }

    if (data) {
      setOccurrenceTypes(data.occurrenceTypes);
      setZones(data.zones);
    }
  }, [setIsVisible, setMessage, sqliteService]);

  const applyLocationUpdate = useCallback((location: Location.LocationObject, options?: LocationUpdateOptions) => {
    const source = options?.source ?? 'device';

    if (source === 'device') {
      latestDeviceLocationRef.current = location;
    }

    if (__DEV__ && isLocationSimulationActiveRef.current && source !== 'simulation') {
      return;
    }

    setCurrentLocation(location);
  }, []);

  const setLocationSimulationActive = useCallback(
    (isActive: boolean) => {
      if (!__DEV__) {
        return;
      }

      const wasActive = isLocationSimulationActiveRef.current;
      isLocationSimulationActiveRef.current = isActive;

      if (wasActive && !isActive && latestDeviceLocationRef.current) {
        applyLocationUpdate(latestDeviceLocationRef.current);
      }
    },
    [applyLocationUpdate],
  );

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    refreshAnnotations();
    loadOptions();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status !== 'granted') {
        setMessage('Permissão de localização negada. Habilite a localização para usar a anotação.');
        setIsVisible(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      if (!mounted) return;

      applyLocationUpdate(location);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: ANNOTATION_LOCATION_DISTANCE_INTERVAL_METERS,
          timeInterval: ANNOTATION_LOCATION_TIME_INTERVAL_MS,
        },
        (newLocation) => {
          if (mounted) {
            applyLocationUpdate(newLocation);
          }
        },
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [applyLocationUpdate, loadOptions, refreshAnnotations, setIsVisible, setMessage]);

  const openAnnotationModal = useCallback(() => {
    setValidationMessage(null);
    setIsAnnotationModalVisible(true);
  }, []);

  const closeAnnotationModal = useCallback(() => {
    setValidationMessage(null);
    setIsAnnotationModalVisible(false);
  }, []);

  const saveAnnotation = useCallback(
    async ({ occurrence, severity, notes }: SaveAnnotationParams) => {
      if (!occurrence) {
        setValidationMessage('Selecione o tipo de ocorrência.');
        return;
      }

      if (!currentLocation) {
        setValidationMessage('Localização atual indisponível.');
        return;
      }

      await sqliteService.createAnnotation({
        deviceId: getAnnotationDeviceId(),
        location: currentLocation,
        notes: notes ?? null,
        occurrence,
        severity: severity ?? null,
      });

      await refreshAnnotations();
      setValidationMessage(null);
      setIsAnnotationModalVisible(false);
      setMessage('Anotação salva localmente.');
      setIsVisible(true);
    },
    [currentLocation, refreshAnnotations, setIsVisible, setMessage, sqliteService],
  );

  const finishActiveAnnotationOperation = useCallback(async () => {
    const operation = activeOperationRef.current ?? (await sqliteService.getActiveOperation());

    if (!operation) {
      setMessage('Nenhuma operação de anotação ativa para finalizar.');
      setIsVisible(true);
      return;
    }

    await sqliteService.finishActiveOperation(operation.id);
    await refreshAnnotations();
    setMessage('Anotação finalizada localmente.');
    setIsVisible(true);
  }, [refreshAnnotations, setIsVisible, setMessage, sqliteService]);

  const syncAnnotations = useCallback(async () => {
    setIsLoading(true);

    try {
      const pendingAnnotations = await sqliteService.getPendingAnnotations();

      if (pendingAnnotations.length === 0) {
        setMessage('Não há anotações pendentes para sincronizar.');
        setIsVisible(true);
        return;
      }

      let syncedCount = 0;
      let errorCount = 0;
      let lastErrorMessage: string | null = null;

      for (const annotation of pendingAnnotations) {
        try {
          await sqliteService.markAnnotationSyncing(annotation.id);
          const payload = await sqliteService.buildSyncPayload(annotation);
          const { data, error } = await annotationRepository.syncAnnotation(payload);

          if (error || !data) {
            const message = error?.message ?? 'A RPC create_occurrence_annotation nao retornou dados.';
            errorCount += 1;
            lastErrorMessage = message;
            await sqliteService.markAnnotationSyncError(annotation.id, message, annotation.field_operation_id ?? null);
            continue;
          }

          await sqliteService.markAnnotationSynced(annotation, data);
          syncedCount += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errorCount += 1;
          lastErrorMessage = message;
          await sqliteService.markAnnotationSyncError(annotation.id, message, annotation.field_operation_id ?? null);
        }
      }

      await refreshAnnotations();
      if (errorCount > 0) {
        const summaryMessage =
          syncedCount > 0
            ? `Sincronizacao parcial: ${syncedCount} anotação(ões) sincronizada(s) e ${errorCount} com erro.`
            : `Erro ao sincronizar anotações: ${errorCount} anotação(ões) com erro.`;
        const detailMessage = lastErrorMessage ? '\n' + lastErrorMessage : '';
        setMessage(summaryMessage + detailMessage);
      } else {
        setMessage(`${syncedCount} anotação(ões) sincronizada(s).`);
      }
      setIsVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao sincronizar anotação.\n' + message);
      setIsVisible(true);
    } finally {
      await refreshAnnotations();
      setIsLoading(false);
    }
  }, [refreshAnnotations, setIsLoading, setIsVisible, setMessage, sqliteService]);

  const clearAnnotations = useCallback(async () => {
    await sqliteService.clearAnnotations();
    await refreshAnnotations();
    setMessage('Anotações apagadas localmente.');
    setIsVisible(true);
  }, [refreshAnnotations, setIsVisible, setMessage, sqliteService]);

  return (
    <AnnotationContext.Provider
      value={{
        currentLocation,
        initialRegion,
        activeOperation,
        annotations,
        summary,
        occurrenceTypes,
        zones,
        isAnnotationModalVisible,
        validationMessage,
        openAnnotationModal,
        closeAnnotationModal,
        applyLocationUpdate,
        setLocationSimulationActive,
        saveAnnotation,
        finishActiveAnnotationOperation,
        syncAnnotations,
        clearAnnotations,
        refreshAnnotations,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotation = () => useContext(AnnotationContext);
