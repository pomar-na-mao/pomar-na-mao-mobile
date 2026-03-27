import { supabase } from '@/data/services/supabase/supabase-connection';
import { useQuery } from '@tanstack/react-query';

const fetchRegions = async () => {
  const { data, error } = await supabase.from('regions').select('*').order('region', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};

export const useRegions = () => {
  return useQuery({
    queryKey: ['region'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 20, // 20 minutos
  });
};
