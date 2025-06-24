
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile, UserFranchise } from '@/types/user';

export const useUserData = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userFranchises, setUserFranchises] = useState<UserFranchise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log('🔍 Iniciando busca de usuários...');
      console.log('🔍 Cliente Supabase configurado:', !!supabase);
      
      // Primeiro, vamos verificar quantos usuários existem
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔍 Total de usuários na base:', count);
      console.log('🔍 Erro na contagem:', countError);
      
      // Agora buscar todos os usuários sem filtros
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 Query executada - SELECT * FROM profiles ORDER BY created_at DESC');
      console.log('🔍 Erro retornado:', error);
      console.log('🔍 Dados retornados:', data);
      console.log('🔍 Quantidade retornada:', data?.length);
      console.log('🔍 Tipo de dados:', typeof data);
      console.log('🔍 É array?', Array.isArray(data));

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem do erro:', error.message);
        console.error('❌ Detalhes do erro:', error.details);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('✅ Dados brutos dos usuários:', data);
      console.log('✅ Usuários carregados da base:', data?.length || 0);
      
      if (data && data.length > 0) {
        data.forEach((user, index) => {
          console.log(`🔄 Processando usuário ${index + 1}:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          });
        });
      }
      
      const typedUsers = (data || []).map(user => {
        return {
          ...user,
          role: user.role as 'superadmin' | 'admin' | 'editor' | 'viewer'
        };
      });
      
      console.log('✅ Usuários processados para estado:', typedUsers.length);
      console.log('✅ Lista final de usuários:', typedUsers);
      
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
      
      const { data, error } = await supabase
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
