import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { sprayingSupabaseService } from '@/data/services/spraying/spraying-supabase-service';
import { useSprayingSqliteService } from '@/data/services/spraying/use-spraying-sqlite-service';
import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { Product, SprayingPlant, SprayingSession } from '@/domain/models/spraying/spraying.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { useSprayingGpsTracker } from '@/shared/hooks/use-spraying-gps-tracker';
import * as Network from 'expo-network';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  handleSyncAndAssociatePlants(radiusMeters?: number): Promise<void>;
  loadAssociatedPlants(sessionId: string): Promise<void>;
  handleDeleteSession(sessionId: string): Promise<void>;
  handleResumeSession(session: SprayingSession): void;
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

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const sprayingService = useSprayingSqliteService();
  const gpsTracker = useSprayingGpsTracker();

  const [sessions, setSessions] = useState<SprayingSession[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [associatedPlants, setAssociatedPlants] = useState<SprayingPlant[]>([]);
  const [plantsData, setPlantsData] = useState<PlantData[]>([]);
  const [lastLoadedRegion, setLastLoadedRegion] = useState<string | undefined>(undefined);
  const [operatorName, setOperatorName] = useState<string>('');

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
        const updated = await sprayingService.getSession(activeSession.id);
        setActiveSession(updated);
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

    const granted = await gpsTracker.startTracking(activeSession.id);
    if (!granted) {
      setMessage('Permissão de localização negada. Habilite nas configurações.');
      setIsVisible(true);
      return;
    }

    setIsTracking(true);
  }, [activeSession]);

  const handleStopTracking = useCallback(async () => {
    await gpsTracker.stopTracking();
    setIsTracking(false);
  }, []);

  const handleSyncAndAssociatePlants = useCallback(
    async (radiusMeters = 15) => {
      if (!activeSession) return;

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

        // 2. Sincroniza pontos GPS (necessário para a RPC PostGIS calcular a rota)
        const routePoints = await sprayingService.getRoutePoints(activeSession.id);
        if (routePoints.length === 0) {
          setMessage('Nenhum ponto GPS registrado nesta sessão.\nInicie o rastreamento durante a pulverização.');
          setIsVisible(true);
          return;
        }
        await sprayingSupabaseService.syncRoutePoints(routePoints);

        // 3. Associa plantas via RPC PostGIS
        const plants = await sprayingSupabaseService.associatePlantsViaRPC(activeSession.id, radiusMeters);

        if (plants.length === 0) {
          setMessage('Nenhuma planta encontrada no raio de ' + radiusMeters + ' m da rota percorrida.');
          setIsVisible(true);
          return;
        }

        // 4. Salva resultado no SQLite local (dirty=0, synced_at preenchido)
        await sprayingService.saveAssociatedPlants(activeSession.id, plants);

        // 5. Marca sessão como sincronizada
        await sprayingService.markSessionSynced(activeSession.id);
        const updatedSession = await sprayingService.getSession(activeSession.id);
        setActiveSession(updatedSession);
        setSessionSynced(true);
        await loadSessions();

        setActiveSession(null);
        setSessionSynced(false);
        setAssociatedPlants([]);
        setPlantsData([]);
        setLastLoadedRegion(undefined);
        setLiveRoutePoints([]);

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
        await sprayingService.deleteSession(sessionId);
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
          setAssociatedPlants([]);
          setSessionSynced(false);
        }
        await loadSessions();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao excluir sessão.\n' + msg);
        setIsVisible(true);
      }
    },
    [activeSession],
  );

  const handleResumeSession = useCallback((session: SprayingSession) => {
    setActiveSession(session);
    setSessionSynced(session.dirty === 0);
    if (session.id) {
      loadAssociatedPlants(session.id);
    }
  }, []);

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
        handleSyncAndAssociatePlants,
        loadAssociatedPlants,
        handleDeleteSession,
        handleResumeSession,
      }}
    >
      {children}
    </SprayingContext.Provider>
  );
};

export const useSpraying = () => useContext(SprayingContext);
