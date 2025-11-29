import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FranchisePublic {
  id: string;
  name: string;
}

export const useFranchisesPublic = () => {
  const { data: franchises = [], isLoading, error, refetch } = useQuery<FranchisePublic[]>({
    queryKey: ['franchises-public', 'v2'], // Atualizar cache key para forçar refetch
    queryFn: async (): Promise<FranchisePublic[]> => {
      console.log('🔍 Fetching from franchises_public VIEW (v2 - only id and name)...');
      
      try {
        // Consultar apenas id e name da VIEW
        const { data, error } = await supabase
          .from('franchises_public')
          .select('id, name')
          .order('name');

        console.log('Raw response:', { data, error });

        if (error) {
          console.error('❌ Error fetching public franchises:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No franchises returned from VIEW');
          return [];
        }

        console.log('✅ Fetched public franchises:', data);

        return data as FranchisePublic[];
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        throw err;
      }
    },
  });

  console.log('useFranchisesPublic result:', { franchises, isLoading, error });

  return {
    franchises,
    loading: isLoading,
    error,
    refetch,
  };
};
