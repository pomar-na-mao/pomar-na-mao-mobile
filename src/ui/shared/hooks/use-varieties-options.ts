import { supabase } from '@/data/services/supabase/supabase-connection';
import type { Variety } from '@/domain/models/shared/varieties.model';
import { generateListOfVarieties } from '@/utils/transformation/array';
import { useQuery } from '@tanstack/react-query';

const fetchVarieties = async () => {
  const { data, error } = await supabase.from('varieties').select('*').order('name', { ascending: false });

  if (error) throw new Error(error.message);

  return generateListOfVarieties(data as Variety[]) || [];
};

export const useVarietyOptions = () => {
  return useQuery({
    queryKey: ['variety-options'],
    queryFn: fetchVarieties,
    staleTime: 1000 * 60 * 60, // 60 minutos
    gcTime: 1000 * 60 * 120, // 120 minutos
  });
};
