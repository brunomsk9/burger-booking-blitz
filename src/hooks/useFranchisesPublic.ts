import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFranchiseDisplayName } from '@/utils/franchiseUtils';

export interface FranchisePublic {
  id: string;
  name: string;
  company_name: string | null;
  slug: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  active: boolean;
  displayName: string;
}

export const useFranchisesPublic = () => {
  const { data: franchises = [], isLoading, error, refetch } = useQuery({
    queryKey: ['franchises-public'],
    queryFn: async () => {
      console.log('🔍 Fetching from franchises_public VIEW...');
      
      try {
        // Tentar consultar a VIEW diretamente
        const { data, error } = await supabase
          .from('franchises_public' as any)
          .select('*')
          .order('company_name' as any);

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

        return (data || []).map((franchise: any) => ({
          ...franchise,
          displayName: getFranchiseDisplayName(franchise)
        }));
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
