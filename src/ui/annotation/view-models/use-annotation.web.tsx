import type {
  AnnotationOccurrenceTypeOption,
  AnnotationRecord,
  AnnotationSummary,
  AnnotationZoneOption,
  LocalAnnotationOperation,
} from '@/domain/models/annotation';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { LocationObject, LocationObjectCoords } from 'expo-location';

interface SaveAnnotationParams {
  occurrence: AnnotationOccurrenceTypeOption;
  severity?: string | null;
  notes?: string | null;
}

interface AnnotationContextProps {
  currentLocation: LocationObject | null;
  initialRegion: LocationObjectCoords | null;
  activeOperation: LocalAnnotationOperation | null;
  annotations: AnnotationRecord[];
  summary: AnnotationSummary;
  occurrenceTypes: AnnotationOccurrenceTypeOption[];
  zones: AnnotationZoneOption[];
  isAnnotationModalVisible: boolean;
  validationMessage: string | null;
  openAnnotationModal(): void;
  closeAnnotationModal(): void;
  applyLocationUpdate(location: LocationObject): void;
  setLocationSimulationActive(isActive: boolean): void;
  saveAnnotation(params: SaveAnnotationParams): Promise<void>;
  finishActiveAnnotationOperation(): Promise<void>;
  syncAnnotations(): Promise<void>;
  clearAnnotations(): Promise<void>;
  refreshAnnotations(): Promise<void>;
}

const AnnotationContext = createContext({} as AnnotationContextProps);

export const AnnotationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAnnotationModalVisible, setIsAnnotationModalVisible] = useState(false);
  const [summary, setSummary] = useState<AnnotationSummary>({ error: 0, pending: 0, synced: 0, total: 0 });

  const currentLocation = useMemo<LocationObject>(
    () => ({
      coords: {
        accuracy: 3,
        altitude: 0,
        altitudeAccuracy: null,
        heading: null,
        latitude: -23.1,
        longitude: -46.1,
        speed: null,
      },
      timestamp: Date.now(),
    }),
    [],
  );

  return (
    <AnnotationContext.Provider
      value={{
        activeOperation: null,
        annotations: [],
        closeAnnotationModal: () => setIsAnnotationModalVisible(false),
        clearAnnotations: async () => setSummary({ error: 0, pending: 0, synced: 0, total: 0 }),
        currentLocation,
        finishActiveAnnotationOperation: async () => undefined,
        initialRegion: currentLocation.coords,
        isAnnotationModalVisible,
        occurrenceTypes: [{ code: 'PST', id: 'occurrence-web', name: 'Praga' }],
        openAnnotationModal: () => setIsAnnotationModalVisible(true),
        refreshAnnotations: async () => undefined,
        saveAnnotation: async () => {
          setSummary({ error: 0, pending: 1, synced: 0, total: 1 });
          setIsAnnotationModalVisible(false);
        },
        summary,
        syncAnnotations: async () => setSummary({ error: 0, pending: 0, synced: 1, total: 0 }),
        validationMessage: null,
        zones: [{ id: 'zone-web', name: 'Web' }],
        applyLocationUpdate: () => undefined,
        setLocationSimulationActive: () => undefined,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotation = () => useContext(AnnotationContext);
