
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile, UserFranchise } from '@/types/user';
import { usePermissions } from './usePermissions';

export const useUserData = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFranchises, setUserFranchises] = useState<UserFranchise[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, isAdmin } = usePermissions();

  const fetchUsers = async () => {
    try {
      console.log('🔍 Iniciando busca de usuários...');
      console.log('🔍 Cliente Supabase configurado:', !!supabase);
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Se for admin (não superadmin), filtrar apenas usuários das suas franquias
      if (isAdmin() && !isSuperAdmin()) {
        console.log('👤 Admin detectado - buscando usuários das franquias do admin');
        
        // Primeiro buscar as franquias do admin atual
        const { data: adminFranchises, error: franchiseError } = await supabase
          .from('user_franchises')
          .select('franchise_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (franchiseError) {
          console.error('❌ Erro ao buscar franquias do admin:', franchiseError);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar suas franquias.',
            variant: 'destructive',
          });
          return;
        }

        if (!adminFranchises || adminFranchises.length === 0) {
          console.log('⚠️ Admin não possui franquias atreladas');
          setUsers([]);
          return;
        }

        const franchiseIds = adminFranchises.map(f => f.franchise_id);
        
        // Buscar usuários que estão nas mesmas franquias
        const { data: franchiseUsers, error: franchiseUsersError } = await supabase
          .from('user_franchises')
          .select('user_id')
          .in('franchise_id', franchiseIds);

        if (franchiseUsersError) {
          console.error('❌ Erro ao buscar usuários das franquias:', franchiseUsersError);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os usuários das franquias.',
            variant: 'destructive',
          });
          return;
        }

        const userIds = [...new Set(franchiseUsers?.map(fu => fu.user_id) || [])];
        
        // Incluir o próprio admin na lista
        const currentUserId = (await supabase.auth.getUser()).data.user?.id;
        if (currentUserId && !userIds.includes(currentUserId)) {
          userIds.push(currentUserId);
        }

        if (userIds.length === 0) {
          console.log('⚠️ Nenhum usuário encontrado nas franquias do admin');
          setUsers([]);
          return;
        }

        query = query.in('id', userIds);
      }

      const { data, error } = await query;

      console.log('🔍 Query executada');
      console.log('🔍 Erro retornado:', error);
      console.log('🔍 Dados retornados:', data);
      console.log('🔍 Quantidade retornada:', data?.length);

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('✅ Dados brutos dos usuários:', data);
      console.log('✅ Usuários carregados da base:', data?.length || 0);
      
      const typedUsers = (data || []).map(user => {
        return {
          ...user,
          role: user.role as 'superadmin' | 'admin' | 'editor' | 'viewer'
        };
      });
      
      console.log('✅ Usuários processados para estado:', typedUsers.length);
      setUsers(typedUsers);
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    }
  };

  const fetchUserFranchises = async () => {
    try {
      console.log('🔍 Buscando franquias dos usuários...');
      
      let query = supabase
        .from('user_franchises')
        .select(`
          id,
          user_id,
          franchise_name,
          franchise_id,
          created_at,
          franchises:franchise_id (
            id,
            name,
            active
          )
        `);

      // Se for admin (não superadmin), filtrar apenas franquias relacionadas
      if (isAdmin() && !isSuperAdmin()) {
        console.log('👤 Admin detectado - buscando franquias relacionadas');
        
        const { data: adminFranchises, error: franchiseError } = await supabase
          .from('user_franchises')
          .select('franchise_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (franchiseError) {
          console.error('❌ Erro ao buscar franquias do admin:', franchiseError);
          return;
        }

        if (!adminFranchises || adminFranchises.length === 0) {
          setUserFranchises([]);
          return;
        }

        const franchiseIds = adminFranchises.map(f => f.franchise_id);
        query = query.in('franchise_id', franchiseIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar franquias dos usuários:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as franquias dos usuários.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('✅ Franquias de usuários carregadas:', data?.length || 0);
      setUserFranchises((data || []) as UserFranchise[]);
    } catch (error) {
      console.error('💥 Erro ao buscar franquias dos usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as franquias dos usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchUsers();
    await fetchUserFranchises();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUsers();
      await fetchUserFranchises();
    };
    
    loadData();
  }, []);

  return {
    users,
    userFranchises,
    loading,
    setUsers,
    setUserFranchises,
    refetch,
  };
};
