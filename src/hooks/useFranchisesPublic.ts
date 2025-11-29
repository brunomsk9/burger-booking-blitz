import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FranchisePublic {
  id: string;
  name: string;
}

export const useFranchisesPublic = () => {
  const { data: franchises = [], isLoading, error, refetch } = useQuery<FranchisePublic[]>({
    queryKey: ['franchises-public'],
    queryFn: async (): Promise<FranchisePublic[]> => {
      console.log('🔍 Fetching from franchises_public VIEW...');
      
      try {
        // Tentar consultar a VIEW diretamente
        const { data, error } = await supabase
          .from('franchises_public' as any)
          .select('*')
          .order('name' as any);

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

        return data as unknown as FranchisePublic[];
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
