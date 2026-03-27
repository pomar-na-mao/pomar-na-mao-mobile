import { supabase } from '@/data/services/supabase/supabase-connection';
import type { Occurrence } from '@/domain/models/shared/occurrences.model';
import { generateListOfOccurrences } from '@/utils/transformation/array';
import { useQuery } from '@tanstack/react-query';

const fetchOccurrences = async () => {
  const { data, error } = await supabase.from('occurrences').select('*').order('id', { ascending: true });

  if (error) throw new Error(error.message);

  return generateListOfOccurrences(data as Occurrence[]);
};

export const useOccurrences = () => {
  return useQuery({
    queryKey: ['occurrence'],
    queryFn: fetchOccurrences,
    staleTime: 1000 * 60 * 60, // 60 minutos
    gcTime: 1000 * 60 * 120, // 120 minutos
  });
};
