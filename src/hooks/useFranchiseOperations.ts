
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getFranchiseDisplayName } from '@/utils/franchiseUtils';

interface Franchise {
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

export const useFranchiseOperations = () => {
  const queryClient = useQueryClient();

  const { data: franchises, isLoading, error } = useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      console.log('🔍 Fetching franchises...');
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name, company_name, address, phone, email, manager_name, active, logo_url, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching franchises:', error);
        throw error;
      }

      console.log('✅ Franchises found:', data);
      
      // Adicionar displayName para cada franquia
      const franchisesWithDisplayName = data.map(franchise => ({
        ...franchise,
        displayName: getFranchiseDisplayName(franchise)
      }));

      console.log('✅ Franchises with display names:', franchisesWithDisplayName);
      return franchisesWithDisplayName as Franchise[];
    },
  });

  const handleToggleActive = async (franchise: Franchise) => {
    try {
      const { error } = await supabase
        .from('franchises')
        .update({ active: !franchise.active })
        .eq('id', franchise.id);

      if (error) {
        console.error('❌ Error updating franchise:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status da franquia.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: `Franquia ${franchise.active ? 'desativada' : 'ativada'} com sucesso!`,
      });

      queryClient.invalidateQueries({ queryKey: ['franchises'] });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar franquia.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateComplete = () => {
    console.log('🔄 Franchise update completed, invalidating cache...');
    queryClient.invalidateQueries({ queryKey: ['franchises'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    queryClient.invalidateQueries({ queryKey: ['user-franchises'] });
  };

  return {
    franchises,
    isLoading,
    error,
    handleToggleActive,
    handleUpdateComplete,
  };
};
