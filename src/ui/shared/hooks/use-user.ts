import { supabase } from '@/data/services/supabase/supabase-connection';
import { useQuery } from '@tanstack/react-query';

const fetchUserData = async ({ queryKey }: { queryKey: [string, string] }) => {
  const [, userId] = queryKey;

  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

  if (error) throw new Error(error.message);

  return data;
};

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUserData,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
};
