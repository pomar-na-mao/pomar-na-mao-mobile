import { supabase } from '@/data/services/supabase/supabase-connection';
import { useQuery } from '@tanstack/react-query';

const fetchRegions = async () => {
  const { data, error } = await supabase.from('zones').select('id,name').order('name', { ascending: true });

  if (error) throw new Error(error.message);

  return data?.map((zone) => ({ label: zone.name, value: zone.id })) || [];
};

export const useRegionOptions = () => {
  return useQuery({
    queryKey: ['zone-options'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 60, // 60 minutos
    gcTime: 1000 * 60 * 120, // 120 minutos
  });
};
