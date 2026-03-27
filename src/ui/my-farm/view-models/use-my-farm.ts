import { plantsRepository } from '@/data/repositories/plants/plants-repository';
import { regionsRepository } from '@/data/repositories/regions/regions-repository';
import type { RegionPolygon, RegionVertex } from '@/domain/models/my-farm/regions.model';
import type { Region } from '@/domain/models/shared/geolocation.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { occurencesLabels } from '@/shared/constants/values';
import { getConvexHull, getPolygonCentroid } from '@/utils/geolocation/geolocation-math';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useMyFarm = () => {
  const [regions, setRegions] = useState<RegionPolygon[]>([]);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [plants, setPlants] = useState<PlantData[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const plantsCache = useRef<Record<string, PlantData[]>>({});

  const fetchPlants = useCallback(
    async (regionName: string, occurrence?: string | null) => {
      const cacheKey = `${regionName}-${occurrence || 'all'}`;

      // Check if we already have the plants for this region/occurrence in our local cache
      if (plantsCache.current[cacheKey]) {
        const cachedPlants = plantsCache.current[cacheKey];
        if (cachedPlants.length === 0) {
          const translatedOccurrence = occurrence ? (occurencesLabels[occurrence] || occurrence) : '';
          setMessage(`Não existem plantas para a região ${regionName}${occurrence ? ` com ocorrência ${translatedOccurrence}` : ''}.`);
          setIsVisible(true);
        }
        setPlants(cachedPlants);
        return;
      }

      try {
        setPlantsLoading(true);
        const { data, error: findPlantsError } = await plantsRepository.findAll({ 
          region: regionName,
          occurrence: occurrence 
        });

        if (findPlantsError) {
          setMessage('Erro ao carregar plantas. Tente novamente.\n' + findPlantsError);
          setIsVisible(true);
          return;
        }

        if (data) {
          if (data.length === 0) {
            const translatedOccurrence = occurrence ? (occurencesLabels[occurrence] || occurrence) : '';
            setMessage(`Não existem plantas para a região ${regionName}${occurrence ? ` com ocorrência ${translatedOccurrence}` : ''}.`);
            setIsVisible(true);
          }
          setPlants(data);
          // Store the result in the cache
          plantsCache.current[cacheKey] = data;
        }
      } catch (error) {
        setMessage('Erro ao carregar plantas. Tente novamente.\n' + error);
        setIsVisible(true);
      } finally {
        setPlantsLoading(false);
      }
    },
    [setMessage, setIsVisible],
  );

  const clearPlants = useCallback(() => {
    setPlants([]);
  }, []);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: findPlantError } = await regionsRepository.findAll();

      if (findPlantError) {
        setMessage('Erro ao carregar regiões. Tente novamente.\n' + findPlantError);
        setIsVisible(true);
        return;
      }

      if (data) {
        // Group vertices by region name
        const grouped = data.reduce((acc: Record<string, RegionVertex[]>, vertex: RegionVertex) => {
          if (!acc[vertex.region]) {
            acc[vertex.region] = [];
          }
          acc[vertex.region].push(vertex);
          return acc;
        }, {});

        const polygons: RegionPolygon[] = Object.entries(grouped).map(([name, vertices]: [string, RegionVertex[]]) => {
          const rawCoords: [number, number][] = vertices.map((v: RegionVertex) => [v.latitude, v.longitude]);
          const hullCoords = getConvexHull(rawCoords);
          const centroidPoints = hullCoords.map(([latitude, longitude]) => ({ latitude, longitude }));
          const centroid = getPolygonCentroid(centroidPoints);

          return {
            name,
            coordinates: hullCoords.map(([latitude, longitude]) => ({
              latitude,
              longitude,
            })),
            centroid,
          };
        });

        setRegions(polygons);

        // Calculate initial region based on first region or average
        if (data.length > 0) {
          const lats = data.map((v: RegionVertex) => v.latitude);
          const longs = data.map((v: RegionVertex) => v.longitude);

          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLong = Math.min(...longs);
          const maxLong = Math.max(...longs);

          setInitialRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLong + maxLong) / 2,
            latitudeDelta: (maxLat - minLat) * 1.5 || 0.01,
            longitudeDelta: (maxLong - minLong) * 1.5 || 0.01,
          });
        }
      }
    } catch (error) {
      setMessage('Erro ao carregar regiões. Tente novamente.\n' + error);
      setIsVisible(true);
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    initialRegion,
    loading,
    error,
    refresh: fetchRegions,
    plants,
    plantsLoading,
    fetchPlants,
    clearPlants,
  };
};
