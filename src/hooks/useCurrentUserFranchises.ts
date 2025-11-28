import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';

interface UserFranchiseData {
  id: string;
  name: string;
  company_name: string | null;
  displayName: string;
}

export const useCurrentUserFranchises = () => {
  const { isSuperAdmin } = usePermissions();

  const { data: franchises = [], isLoading: loading } = useQuery({
    queryKey: ['current-user-franchises', isSuperAdmin()],
    queryFn: async () => {
      console.log('🔍 useCurrentUserFranchises - isSuperAdmin:', isSuperAdmin());
      
      // Superadmin vê todas as franquias, outros veem apenas as suas
      if (isSuperAdmin()) {
        const { data, error } = await supabase
          .from('franchises')
          .select('id, name, company_name')
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('❌ Erro ao buscar franchises (superadmin):', error);
          throw error;
        }

        console.log('✅ Franchises (superadmin):', data?.length);
        return (data || []).map(f => ({
          ...f,
          displayName: f.company_name || f.name
        }));
      } else {
        // Buscar franquias do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuário atual:', user?.id, user?.email);
        
        if (!user) {
          console.warn('⚠️ Nenhum usuário autenticado');
          return [];
        }

        const { data: userFranchises, error } = await supabase
          .from('user_franchises')
          .select(`
            franchise_id,
            franchises:franchise_id (
              id,
              name,
              company_name,
              active
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Erro ao buscar user_franchises:', error);
          throw error;
        }

        console.log('📋 User franchises encontradas:', userFranchises?.length);
        console.log('📋 Dados:', userFranchises);

        const filtered = (userFranchises || [])
          .filter(uf => uf.franchises && (uf.franchises as any).active)
          .map(uf => {
            const franchise = uf.franchises as any;
            return {
              id: franchise.id,
              name: franchise.name,
              company_name: franchise.company_name,
              displayName: franchise.company_name || franchise.name
            };
          });
        
        console.log('✅ Franchises filtradas:', filtered.length, filtered);
        return filtered;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Garbage collect após 10 minutos
  });

  return { franchises, loading };
};
