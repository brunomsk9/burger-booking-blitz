
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFranchiseDisplayName } from '@/utils/franchiseUtils';

export interface Franchise {
  id: string;
  name: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  active: boolean;
  logo_url: string | null;
  webhook_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  slug: string | null;
  created_at: string;
  displayName?: string;
}

export const useFranchises = () => {
  const { data: franchises, isLoading, error, refetch } = useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      console.log('🔍 Fetching active franchises...');
      
      try {
        const { data, error } = await supabase
          .from('franchises')
          .select('*')
          .eq('active', true)
          .order('company_name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching franchises:', error);
          throw error;
        }

        console.log('✅ Active franchises found:', data);
        
        if (!data || data.length === 0) {
          console.warn('⚠️ No active franchises found in database');
          return [];
        }
        
        // Adicionar displayName para cada franquia
        const franchisesWithDisplayName = data.map(franchise => ({
          ...franchise,
          displayName: getFranchiseDisplayName(franchise)
        }));

        console.log('✅ Franchises with display names:', franchisesWithDisplayName);
        return franchisesWithDisplayName as Franchise[];
      } catch (err) {
        console.error('❌ Unexpected error in useFranchises:', err);
        throw err;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  });

  console.log('🔍 useFranchises hook state:', {
    franchises: franchises || [],
    loading: isLoading,
    error,
    count: franchises?.length || 0
  });

  return {
    franchises: franchises || [],
    loading: isLoading,
    error,
    refetch,
  };
};
