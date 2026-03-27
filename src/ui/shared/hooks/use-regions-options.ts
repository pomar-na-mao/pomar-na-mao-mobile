import { supabase } from '@/data/services/supabase/supabase-connection';
import type { FarmRegion } from '@/domain/models/shared/farm-regions.model';
import { generateListOfFarmRegions } from '@/utils/transformation/array';
import { useQuery } from '@tanstack/react-query';

const fetchRegions = async () => {
  const { data, error } = await supabase.from('regions').select('*').order('region', { ascending: true });

  if (error) throw new Error(error.message);

  return generateListOfFarmRegions(data as FarmRegion[]) || [];
};

export const useRegionOptions = () => {
  return useQuery({
    queryKey: ['region-options'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 60, // 60 minutos
    gcTime: 1000 * 60 * 120, // 120 minutos
  });
};
