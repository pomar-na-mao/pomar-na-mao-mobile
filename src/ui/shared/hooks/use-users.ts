import { supabase } from '@/data/services/supabase/supabase-connection';
import type { iUser } from '@/domain/models/shared/user.model';
import { generateListOfUsers } from '@/utils/transformation/array';
import { useQuery } from '@tanstack/react-query';

const fetchUsersData = async () => {
  const { data: users, error } = await supabase.from('users').select('*');

  if (error) throw new Error(error.message);

  return generateListOfUsers(users as iUser[]);
};

export const useUsersData = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersData,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
};
