
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';

export const useUserProfile = (user: User | null, setAuthLoading: (loading: boolean) => void) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 Resultado da query do perfil:', { data, error });

      if (error) {
        console.error('❌ Erro na query do perfil:', error);
        return null;
      }

      if (data) {
        console.log('✅ Perfil encontrado:', data);
        const profile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as 'superadmin' | 'admin' | 'editor' | 'viewer',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        console.log('📋 Perfil processado:', profile);
        return profile;
      }

      console.log('⚠️ Nenhum perfil encontrado para usuário:', userId);
      return null;
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  const refetchProfile = async () => {
    if (user) {
      console.log('🔄 Refazendo busca do perfil...');
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (user && isMounted) {
        console.log('👤 Carregando perfil para usuário:', user.id);
        try {
          const profile = await fetchUserProfile(user.id);
          if (isMounted) {
            setUserProfile(profile);
            console.log('✅ Perfil carregado com sucesso:', profile);
          }
        } catch (error) {
          console.error('💥 Erro ao carregar perfil:', error);
        } finally {
          if (isMounted) {
            setAuthLoading(false);
            console.log('⏹️ Loading finalizado');
          }
        }
      } else if (!user && isMounted) {
        console.log('🚪 Usuário deslogado, limpando perfil');
        setUserProfile(null);
        setAuthLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user, setAuthLoading]);

  return { userProfile, refetchProfile };
};
