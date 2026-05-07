import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { SprayingSession } from '@/domain/models/spraying/spraying.model';
import { create } from 'zustand';

interface SprayingStore {
  activeSession: SprayingSession | null;
  setActiveSession: (session: SprayingSession | null) => void;

  isTracking: boolean;
  setIsTracking: (isTracking: boolean) => void;

  trackingStartedAt: string | null;
  setTrackingStartedAt: (ts: string | null) => void;

  isMockingLocation: boolean;
  setIsMockingLocation: (isMockingLocation: boolean) => void;

  sessionSynced: boolean;
  setSessionSynced: (synced: boolean) => void;

  liveRoutePoints: { latitude: number; longitude: number }[];
  setLiveRoutePoints: (points: { latitude: number; longitude: number }[]) => void;
  addLiveRoutePoint: (point: { latitude: number; longitude: number }) => void;

  plantsData: PlantData[];
  setPlantsData: (plantsData: PlantData[]) => void;

  lastLoadedRegion?: string;
  setLastLoadedRegion: (region?: string) => void;

  operatorName: string;
  setOperatorName: (operatorName: string) => void;
}

export const useSprayingStore = create<SprayingStore>((set) => ({
  activeSession: null,
  setActiveSession: (activeSession) => set(() => ({ activeSession })),

  isTracking: false,
  setIsTracking: (isTracking) => set(() => ({ isTracking })),

  trackingStartedAt: null,
  setTrackingStartedAt: (trackingStartedAt) => set(() => ({ trackingStartedAt })),

  isMockingLocation: false,
  setIsMockingLocation: (isMockingLocation) => set(() => ({ isMockingLocation })),

  sessionSynced: false,
  setSessionSynced: (sessionSynced) => set(() => ({ sessionSynced })),

  liveRoutePoints: [],
  setLiveRoutePoints: (liveRoutePoints) => set(() => ({ liveRoutePoints })),
  addLiveRoutePoint: (point) => set((state) => ({ liveRoutePoints: [...state.liveRoutePoints, point] })),

  plantsData: [],
  setPlantsData: (plantsData) => set(() => ({ plantsData })),

  lastLoadedRegion: undefined,
  setLastLoadedRegion: (lastLoadedRegion) => set(() => ({ lastLoadedRegion })),

  operatorName: '',
  setOperatorName: (operatorName) => set(() => ({ operatorName })),
}));
