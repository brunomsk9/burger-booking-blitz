
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/user';

export const useUserRoleActions = (setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>) => {
  const updateUserRole = async (userId: string, role: UserProfile['role']) => {
    try {
      console.log('Atualizando papel do usuário:', userId, role);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar papel do usuário:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o papel do usuário.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      const typedUser = {
        ...data,
        role: data.role as 'superadmin' | 'admin' | 'editor' | 'viewer'
      };
      
      setUsers(prev => prev.map(u => u.id === userId ? typedUser : u));
      toast({
        title: 'Sucesso!',
        description: 'Papel do usuário atualizado com sucesso.',
      });
      
      return { data: typedUser, error: null };
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o papel do usuário.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  return {
    updateUserRole,
  };
};
