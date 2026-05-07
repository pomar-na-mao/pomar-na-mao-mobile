import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import {
  SPRAYING_ASSOCIATION_RADIUS_METERS,
  sprayingSupabaseService,
} from '@/data/services/spraying/spraying-supabase-service';
import { useSprayingSqliteService } from '@/data/services/spraying/use-spraying-sqlite-service';
import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { Product, SprayingPlant, SprayingSession } from '@/domain/models/spraying/spraying.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { useSprayingGpsTracker } from '@/shared/hooks/use-spraying-gps-tracker';
import * as Network from 'expo-network';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ReviewOverride = 'added' | 'removed';

interface SprayingContextProps {
  sessions: SprayingSession[];
  activeProducts: Product[];
  associatedPlants: SprayingPlant[];
  plantsData: PlantData[];
  lastLoadedRegion?: string;
  operatorName: string;
  setOperatorName(name: string): void;
  loadSessions(): Promise<void>;
  loadActiveProducts(): Promise<void>;
  loadPlantsByRegion(region: string): Promise<void>;
  handleStartSession(operatorName?: string, region?: string, products?: SprayingProductInput[]): Promise<boolean>;
  handleFinishSession(notes?: string, waterVolume?: number): Promise<void>;
  handleStartTracking(): Promise<void>;
  handleStopTracking(): Promise<void>;
  handleSyncSession(session: SprayingSession, radiusMeters?: number): Promise<void>;
  handleSyncAndAssociatePlants(radiusMeters?: number): Promise<void>;
  loadAssociatedPlants(sessionId: string): Promise<void>;
  handleDeleteSession(sessionId: string): Promise<void>;
  handleResumeSession(session: SprayingSession): void;
  // Review mode
  isReviewMode: boolean;
  reviewPreviewIds: Set<string>;
  reviewOverrides: Map<string, ReviewOverride>;
  reviewFinalIds: Set<string>;
  handleEnterReviewMode(radiusMeters?: number): Promise<void>;
  handleCancelReview(): void;
  handleConfirmReview(radiusMeters?: number): Promise<void>;
  handleToggleReviewPlant(plantId: string): void;
}

const SprayingContext = createContext({} as SprayingContextProps);

export interface SprayingProductInput {
  productId: string;
  dose: number;
  doseUnit: string;
}

export const SprayingProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeSession, setActiveSession, isTracking, setIsTracking, setSessionSynced, setLiveRoutePoints } =
    useSprayingStore((state) => state);
  const { plantsData, setPlantsData, lastLoadedRegion, setLastLoadedRegion, operatorName, setOperatorName } =
    useSprayingStore((state) => state);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const sprayingService = useSprayingSqliteService();
  const gpsTracker = useSprayingGpsTracker();

  const [sessions, setSessions] = useState<SprayingSession[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [associatedPlants, setAssociatedPlants] = useState<SprayingPlant[]>([]);

  // Review mode state
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewPreviewIds, setReviewPreviewIds] = useState<Set<string>>(new Set());
  const [reviewOverrides, setReviewOverrides] = useState<Map<string, ReviewOverride>>(new Map());
  const [reviewRadiusMeters, setReviewRadiusMeters] = useState(SPRAYING_ASSOCIATION_RADIUS_METERS);

  useEffect(() => {
    loadSessions();
    loadActiveProducts();
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const all = await sprayingService.getAllSessions();
      setSessions(all);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao carregar sessões.\n' + msg);
      setIsVisible(true);
    }
  }, []);

  const loadActiveProducts = useCallback(async () => {
    try {
      let products = await sprayingService.getActiveProducts();

      try {
        const remoteProducts = await sprayingSupabaseService.getActiveProducts();

        if (remoteProducts.length > 0) {
          await sprayingService.saveProducts(remoteProducts as Product[]);
          products = await sprayingService.getActiveProducts();
        }
      } catch (remoteError) {
        if (products.length === 0) {
          throw remoteError;
        }
      }

      setActiveProducts(products);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao carregar produtos.\n' + msg);
      setIsVisible(true);
    }
  }, []);

  /** Carrega as plantas da região para exibição no mapa */
  const loadPlantsByRegion = useCallback(async (region: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await plantsRepository.findAll({ region, occurrence: null });
      if (error) {
        setMessage('Erro ao buscar plantas.\n' + error.message);
        setIsVisible(true);
        return;
      }
      setPlantsData(data ?? []);
      setLastLoadedRegion(region);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao buscar plantas.\n' + msg);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartSession = useCallback(
    async (operatorName?: string, region?: string, products?: SprayingProductInput[]): Promise<boolean> => {
      setIsLoading(true);
      try {
        const id = await sprayingService.startSession(operatorName, region);

        for (const product of products ?? []) {
          await sprayingService.addProductToSession(id, product.productId, product.dose, product.doseUnit);
        }

        const session = await sprayingService.getSession(id);
        setActiveSession(session);
        setSessionSynced(false);
        await loadSessions();
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao iniciar sessão.\n' + msg);
        setIsVisible(true);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleFinishSession = useCallback(
    async (notes?: string, waterVolume?: number) => {
      if (!activeSession) return;

      setIsLoading(true);
      try {
        if (isTracking) {
          await gpsTracker.stopTracking();
          setIsTracking(false);
        }
        await sprayingService.finishSession(activeSession.id, notes, waterVolume);
        setActiveSession(null);
        setSessionSynced(false);
        setAssociatedPlants([]);
        setLiveRoutePoints([]);
        await loadSessions();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao finalizar sessão.\n' + msg);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession, isTracking],
  );

  const handleStartTracking = useCallback(async () => {
    if (!activeSession) {
      setMessage('Inicie uma sessão antes de rastrear.');
      setIsVisible(true);
      return;
    }

    const now = new Date().toISOString();
    const granted = await gpsTracker.startTracking(activeSession.id);
    if (!granted) {
      setMessage('Permissão de localização negada. Habilite nas configurações.');
      setIsVisible(true);
      return;
    }

    // Grava o horário exato de início da gravação
    await sprayingService.setSessionStartedAt(activeSession.id, now);
    setIsTracking(true);
  }, [activeSession]);

  const handleStopTracking = useCallback(async () => {
    const now = new Date().toISOString();
    await gpsTracker.stopTracking();
    // Grava o horário exato de fim da gravação
    if (activeSession) {
      await sprayingService.setSessionEndedAt(activeSession.id, now);
    }
    setIsTracking(false);
  }, [activeSession]);

  const syncSession = useCallback(
    async (session: SprayingSession, radiusMeters = SPRAYING_ASSOCIATION_RADIUS_METERS) => {
      if (!session) return;

      setIsLoading(true);
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
          setIsVisible(true);
          return;
        }

        // 1. Sincroniza sessão
        await sprayingSupabaseService.syncSession({
          id: session.id,
          started_at: session.started_at,
          ended_at: session.ended_at,
          operator_name: session.operator_name,
          status: session.status,
          region: session.region,
          notes: session.notes,
          water_volume_liters: session.water_volume_liters,
          created_at: session.created_at,
        });

        const sessionProducts = await sprayingService.getSessionProducts(session.id);
        if (sessionProducts.length === 0) {
          setMessage('Associe pelo menos um produto antes de sincronizar a pulverização.');
          setIsVisible(true);
          return;
        }
        await sprayingSupabaseService.syncProducts(sessionProducts);

        await sprayingService.flushRouteBuffer();

        // 2. Sincroniza pontos GPS (necessário para a RPC PostGIS calcular a rota)
        const routePoints = await sprayingService.getRoutePoints(session.id);
        if (routePoints.length === 0) {
          setMessage('Nenhum ponto GPS registrado nesta sessão.\nInicie o rastreamento durante a pulverização.');
          setIsVisible(true);
          return;
        }
        await sprayingSupabaseService.syncRoutePoints(routePoints);

        // 3. Associa plantas via RPC PostGIS
        const plants = await sprayingSupabaseService.associatePlantsViaRPC(session.id, radiusMeters);

        if (plants.length === 0) {
          setMessage(
            'Nenhuma planta encontrada no raio de ' +
              radiusMeters +
              ' m da rota percorrida.\nPontos sincronizados: ' +
              routePoints.length,
          );
          setIsVisible(true);
          return;
        }

        // 4. Salva resultado no SQLite local (dirty=0, synced_at preenchido)
        await sprayingService.saveAssociatedPlants(session.id, plants);

        // 5. Marca sessão como sincronizada
        await sprayingService.markSessionSynced(session.id);
        await sprayingService.hardDeleteSession(session.id);

        if (activeSession?.id === session.id) {
          setActiveSession(null);
          setSessionSynced(false);
          setAssociatedPlants([]);
          setLiveRoutePoints([]);
        }
        await loadSessions();

        setMessage(`${plants.length} planta(s) associada(s) com sucesso.`);
        setIsVisible(true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao sincronizar e associar plantas.\n' + msg);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession],
  );

  const handleSyncSession = useCallback(
    async (session: SprayingSession, radiusMeters = SPRAYING_ASSOCIATION_RADIUS_METERS) => {
      await syncSession(session, radiusMeters);
    },
    [syncSession],
  );

  const handleSyncAndAssociatePlants = useCallback(
    async (radiusMeters = SPRAYING_ASSOCIATION_RADIUS_METERS) => {
      if (!activeSession) return;
      await syncSession(activeSession, radiusMeters);
    },
    [activeSession, syncSession],
  );

  /** Entra no modo de revisão: sincroniza dados e busca prévia de plantas sem persistir */
  const handleEnterReviewMode = useCallback(
    async (radiusMeters = SPRAYING_ASSOCIATION_RADIUS_METERS) => {
      if (!activeSession) return;

      setIsLoading(true);
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
          setIsVisible(true);
          return;
        }

        // Sync session data to Supabase so the RPC can read route points
        await sprayingSupabaseService.syncSession({
          id: activeSession.id,
          started_at: activeSession.started_at,
          ended_at: activeSession.ended_at,
          operator_name: activeSession.operator_name,
          status: activeSession.status,
          region: activeSession.region,
          notes: activeSession.notes,
          water_volume_liters: activeSession.water_volume_liters,
          created_at: activeSession.created_at,
        });

        const sessionProducts = await sprayingService.getSessionProducts(activeSession.id);
        if (sessionProducts.length === 0) {
          setMessage('Associe pelo menos um produto antes de sincronizar a pulverização.');
          setIsVisible(true);
          return;
        }
        await sprayingSupabaseService.syncProducts(sessionProducts);

        await sprayingService.flushRouteBuffer();
        const routePoints = await sprayingService.getRoutePoints(activeSession.id);
        if (routePoints.length === 0) {
          setMessage('Nenhum ponto GPS registrado nesta sessão.\nInicie o rastreamento durante a pulverização.');
          setIsVisible(true);
          return;
        }
        await sprayingSupabaseService.syncRoutePoints(routePoints);

        // Preview: busca plantas sem persistir
        const previewed = await sprayingSupabaseService.previewPlantsForSession(activeSession.id, radiusMeters);

        if (previewed.length === 0) {
          setMessage(
            'Nenhuma planta encontrada no raio de ' +
              radiusMeters +
              ' m da rota percorrida.\nVocê pode adicionar plantas manualmente na revisão.',
          );
          setIsVisible(true);
        }

        setReviewPreviewIds(new Set(previewed.map((p) => p.plant_id)));
        setReviewOverrides(new Map());
        setReviewRadiusMeters(radiusMeters);
        setIsReviewMode(true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao entrar no modo de revisão.\n' + msg);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession],
  );

  const handleCancelReview = useCallback(() => {
    setIsReviewMode(false);
    setReviewPreviewIds(new Set());
    setReviewOverrides(new Map());
  }, []);

  /** Alterna o estado de uma planta na revisão (adicionada manualmente ou removida) */
  const handleToggleReviewPlant = useCallback(
    (plantId: string) => {
      setReviewOverrides((prev) => {
        const next = new Map(prev);
        const isPreSelected = reviewPreviewIds.has(plantId);
        const currentOverride = next.get(plantId);

        if (isPreSelected) {
          // Era auto-selecionada → marcar como removida, ou restaurar
          if (currentOverride === 'removed') {
            next.delete(plantId);
          } else {
            next.set(plantId, 'removed');
          }
        } else {
          // Não era auto-selecionada → marcar como adicionada, ou restaurar
          if (currentOverride === 'added') {
            next.delete(plantId);
          } else {
            next.set(plantId, 'added');
          }
        }

        return next;
      });
    },
    [reviewPreviewIds],
  );

  /** Computes the final set of plant IDs after applying manual overrides */
  const reviewFinalIds = useMemo(() => {
    const ids = new Set(reviewPreviewIds);
    for (const [id, override] of reviewOverrides) {
      if (override === 'added') {
        ids.add(id);
      } else {
        ids.delete(id);
      }
    }
    return ids;
  }, [reviewPreviewIds, reviewOverrides]);

  /** Confirma a revisão e executa a associação com o conjunto final ajustado */
  const handleConfirmReview = useCallback(
    async (radiusMeters = reviewRadiusMeters) => {
      if (!activeSession) return;
      setIsLoading(true);
      try {
        // Primeiro executa a RPC original para persistir as plantas auto-selecionadas
        const includeIds = Array.from(reviewOverrides.entries())
          .filter(([_, value]) => value === 'added')
          .map(([id]) => id);
        const excludeIds = Array.from(reviewOverrides.entries())
          .filter(([_, value]) => value === 'removed')
          .map(([id]) => id);

        const plants = await sprayingSupabaseService.associatePlantsViaRPC(
          activeSession.id,
          radiusMeters,
          includeIds,
          excludeIds,
        );

        if (plants.length === 0 && reviewFinalIds.size === 0) {
          setMessage('Nenhuma planta associada.');
          setIsVisible(true);
        }

        await sprayingService.saveAssociatedPlants(activeSession.id, plants);
        await sprayingService.markSessionSynced(activeSession.id);
        await sprayingService.hardDeleteSession(activeSession.id);

        setIsReviewMode(false);
        setReviewPreviewIds(new Set());
        setReviewOverrides(new Map());

        if (activeSession) {
          setActiveSession(null);
          setSessionSynced(false);
          setAssociatedPlants([]);
          setLiveRoutePoints([]);
        }
        await loadSessions();

        setMessage(`${plants.length} planta(s) associada(s) com sucesso.`);
        setIsVisible(true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao confirmar revisão.\n' + msg);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession, reviewRadiusMeters, reviewFinalIds, reviewOverrides],
  );

  const loadAssociatedPlants = useCallback(async (sessionId: string) => {
    try {
      const plants = await sprayingService.getAssociatedPlants(sessionId);
      setAssociatedPlants(plants);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao carregar plantas associadas.\n' + msg);
      setIsVisible(true);
    }
  }, []);

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await sprayingService.hardDeleteSession(sessionId);
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
          setAssociatedPlants([]);
          setSessionSynced(false);
          setLiveRoutePoints([]);
        }
        await loadSessions();
        setMessage('Pulverização excluída localmente.');
        setIsVisible(true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao excluir sessão.\n' + msg);
        setIsVisible(true);
      }
    },
    [activeSession],
  );

  const handleResumeSession = useCallback(
    (session: SprayingSession) => {
      setActiveSession(session);
      setSessionSynced(session.dirty === 0);
      if (session.id) {
        loadAssociatedPlants(session.id);
      }
      if (session.region) {
        loadPlantsByRegion(session.region);
      }
    },
    [loadAssociatedPlants, loadPlantsByRegion],
  );

  return (
    <SprayingContext.Provider
      value={{
        sessions,
        activeProducts,
        associatedPlants,
        plantsData,
        lastLoadedRegion,
        operatorName,
        setOperatorName,
        loadSessions,
        loadActiveProducts,
        loadPlantsByRegion,
        handleStartSession,
        handleFinishSession,
        handleStartTracking,
        handleStopTracking,
        handleSyncSession,
        handleSyncAndAssociatePlants,
        loadAssociatedPlants,
        handleDeleteSession,
        handleResumeSession,
        isReviewMode,
        reviewPreviewIds,
        reviewOverrides,
        reviewFinalIds,
        handleEnterReviewMode,
        handleCancelReview,
        handleConfirmReview,
        handleToggleReviewPlant,
      }}
    >
      {children}
    </SprayingContext.Provider>
  );
};

export const useSpraying = () => useContext(SprayingContext);
