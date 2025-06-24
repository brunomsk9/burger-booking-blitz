
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserFranchise } from '@/types/user';

export const useUserFranchiseActions = (setUserFranchises: React.Dispatch<React.SetStateAction<UserFranchise[]>>) => {
  const assignUserToFranchise = async (userId: string, franchiseId: string) => {
    try {
      console.log('Atrelando usuário à franquia:', userId, franchiseId);
      
      // Primeiro buscar o nome da franquia
      const { data: franchise, error: franchiseError } = await supabase
        .from('franchises')
        .select('name')
        .eq('id', franchiseId)
        .single();

      if (franchiseError) {
        console.error('Erro ao buscar franquia:', franchiseError);
        toast({
          title: 'Erro',
          description: 'Não foi possível encontrar a franquia.',
          variant: 'destructive',
        });
        return { data: null, error: franchiseError };
      }

      const { data, error } = await supabase
        .from('user_franchises')
        .insert([{ 
          user_id: userId, 
          franchise_id: franchiseId,
          franchise_name: franchise.name 
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao atrelar usuário à franquia:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atrelar o usuário à franquia.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      setUserFranchises(prev => [...prev, data as UserFranchise]);
      toast({
        title: 'Sucesso!',
        description: 'Usuário atrelado à franquia com sucesso.',
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atrelar usuário à franquia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atrelar o usuário à franquia.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const removeUserFromFranchise = async (userFranchiseId: string) => {
    try {
      console.log('Removendo usuário da franquia:', userFranchiseId);
      
      const { error } = await supabase
        .from('user_franchises')
        .delete()
        .eq('id', userFranchiseId);

      if (error) {
        console.error('Erro ao remover usuário da franquia:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível remover o usuário da franquia.',
          variant: 'destructive',
        });
        return { error };
      }
      
      setUserFranchises(prev => prev.filter(uf => uf.id !== userFranchiseId));
      toast({
        title: 'Sucesso!',
        description: 'Usuário removido da franquia com sucesso.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover usuário da franquia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o usuário da franquia.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    assignUserToFranchise,
    removeUserFromFranchise,
  };
};
