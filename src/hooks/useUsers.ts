
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface UserFranchise {
  id: string;
  user_id: string;
  franchise_name: string;
  created_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFranchises, setUserFranchises] = useState<UserFranchise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log('Buscando usuários...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários carregados:', data?.length || 0);
      setUsers((data || []) as UserProfile[]);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    }
  };

  const fetchUserFranchises = async () => {
    try {
      console.log('Buscando franquias dos usuários...');
      const { data, error } = await supabase
        .from('user_franchises')
        .select('*');

      if (error) {
        console.error('Erro ao buscar franquias dos usuários:', error);
        throw error;
      }
      
      console.log('Franquias de usuários carregadas:', data?.length || 0);
      setUserFranchises((data || []) as UserFranchise[]);
    } catch (error) {
      console.error('Erro ao buscar franquias dos usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserProfile['role']) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? data as UserProfile : u));
      toast({
        title: 'Sucesso!',
        description: 'Papel do usuário atualizado com sucesso.',
      });
      
      return { data, error: null };
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

  const assignUserToFranchise = async (userId: string, franchiseName: string) => {
    try {
      const { data, error } = await supabase
        .from('user_franchises')
        .insert([{ user_id: userId, franchise_name: franchiseName }])
        .select()
        .single();

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('user_franchises')
        .delete()
        .eq('id', userFranchiseId);

      if (error) throw error;
      
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

  useEffect(() => {
    fetchUsers();
    fetchUserFranchises();
  }, []);

  return {
    users,
    userFranchises,
    loading,
    updateUserRole,
    assignUserToFranchise,
    removeUserFromFranchise,
    refetch: () => {
      fetchUsers();
      fetchUserFranchises();
    },
  };
};
