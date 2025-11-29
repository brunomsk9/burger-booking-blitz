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
      const { data, error } = await supabase
        .from('franchises_public')
        .select('*')
        .order('company_name');

      if (error) {
        console.error('Error fetching public franchises:', error);
        throw error;
      }

      return (data || []).map(franchise => ({
        ...franchise,
        displayName: getFranchiseDisplayName(franchise)
      }));
    },
  });

  return {
    franchises,
    loading: isLoading,
    error,
    refetch,
  };
};
