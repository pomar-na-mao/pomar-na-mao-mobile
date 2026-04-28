import type { SprayingSession } from '@/domain/models/spraying/spraying.model';
import { create } from 'zustand';

interface SprayingStore {
  activeSession: SprayingSession | null;
  setActiveSession: (session: SprayingSession | null) => void;

  isTracking: boolean;
  setIsTracking: (isTracking: boolean) => void;

  sessionSynced: boolean;
  setSessionSynced: (synced: boolean) => void;

  liveRoutePoints: { latitude: number; longitude: number }[];
  setLiveRoutePoints: (points: { latitude: number; longitude: number }[]) => void;
  addLiveRoutePoint: (point: { latitude: number; longitude: number }) => void;
}

export const useSprayingStore = create<SprayingStore>((set) => ({
  activeSession: null,
  setActiveSession: (activeSession) => set(() => ({ activeSession })),

  isTracking: false,
  setIsTracking: (isTracking) => set(() => ({ isTracking })),

  sessionSynced: false,
  setSessionSynced: (sessionSynced) => set(() => ({ sessionSynced })),

  liveRoutePoints: [],
  setLiveRoutePoints: (liveRoutePoints) => set(() => ({ liveRoutePoints })),
  addLiveRoutePoint: (point) => set((state) => ({ liveRoutePoints: [...state.liveRoutePoints, point] })),
}));
