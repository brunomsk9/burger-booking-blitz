import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FranchisePublic {
  id: string;
  name: string;
  slug: string | null;
}

export const useFranchisesPublic = () => {
  const { data: franchises = [], isLoading, error, refetch } = useQuery<FranchisePublic[]>({
    queryKey: ['franchises-public', 'v3'], // Atualizar cache key
    queryFn: async (): Promise<FranchisePublic[]> => {
      console.log('🔍 Fetching from franchises_public VIEW (v3 - with slug)...');
      
      try {
        // Consultar id, name e slug da VIEW
        const { data, error } = await supabase
          .from('franchises_public')
          .select('id, name, slug')
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
