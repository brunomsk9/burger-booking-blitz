
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
  created_at: string;
  displayName?: string;
}

export const useFranchises = () => {
  const { data: franchises, isLoading, error, refetch } = useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      console.log('🔍 Fetching active franchises...');
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name, company_name, address, phone, email, manager_name, active, logo_url, created_at')
        .eq('active', true)
        .order('company_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching franchises:', error);
        throw error;
      }

      console.log('✅ Active franchises found:', data);
      
      // Adicionar displayName para cada franquia
      const franchisesWithDisplayName = data.map(franchise => ({
        ...franchise,
        displayName: getFranchiseDisplayName(franchise)
      }));

      console.log('✅ Franchises with display names:', franchisesWithDisplayName);
      return franchisesWithDisplayName as Franchise[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    franchises: franchises || [],
    loading: isLoading,
    error,
    refetch,
  };
};
