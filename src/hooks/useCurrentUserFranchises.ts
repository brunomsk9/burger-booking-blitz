import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';

interface UserFranchiseData {
  id: string;
  name: string;
  company_name: string | null;
  displayName: string;
}

export const useCurrentUserFranchises = () => {
  const [franchises, setFranchises] = useState<UserFranchiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    const fetchUserFranchises = async () => {
      try {
        setLoading(true);
        
        // Superadmin vê todas as franquias, outros veem apenas as suas
        if (isSuperAdmin()) {
          const { data, error } = await supabase
            .from('franchises')
            .select('id, name, company_name')
            .eq('active', true)
            .order('name');

          if (error) throw error;

          const franchisesWithDisplay = (data || []).map(f => ({
            ...f,
            displayName: f.company_name || f.name
          }));

          setFranchises(franchisesWithDisplay);
        } else {
          // Buscar franquias do usuário atual
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setFranchises([]);
            return;
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

          if (error) throw error;

          const activeFranchises = (userFranchises || [])
            .filter(uf => uf.franchises && uf.franchises.active)
            .map(uf => {
              const franchise = uf.franchises as any;
              return {
                id: franchise.id,
                name: franchise.name,
                company_name: franchise.company_name,
                displayName: franchise.company_name || franchise.name
              };
            });

          setFranchises(activeFranchises);
        }
      } catch (error) {
        console.error('Erro ao buscar franquias do usuário:', error);
        setFranchises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFranchises();
  }, [isSuperAdmin]);

  return { franchises, loading };
};
