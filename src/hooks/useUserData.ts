
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
      
      // Primeiro, vamos verificar a conexão
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      console.log('🔍 Teste de conexão - Count:', testData, 'Error:', testError);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 Query executada');
      console.log('🔍 Erro retornado:', error);
      console.log('🔍 Dados retornados:', data);
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
      console.log('✅ Usuários carregados:', data?.length || 0);
      
      const typedUsers = (data || []).map(user => {
        console.log('🔄 Processando usuário:', user);
        return {
          ...user,
          role: user.role as 'superadmin' | 'admin' | 'editor' | 'viewer'
        };
      });
      
      console.log('✅ Usuários processados:', typedUsers);
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
