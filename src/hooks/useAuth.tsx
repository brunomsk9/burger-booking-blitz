
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 Iniciando busca do perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 Resposta da query profiles:', { data, error });

      if (error) {
        console.error('❌ Erro na query do perfil:', error);
        console.error('❌ Detalhes do erro:', error.message, error.details, error.hint);
        return null;
      }

      if (data) {
        console.log('✅ Dados brutos do perfil encontrados:', data);
        const profile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as 'superadmin' | 'admin' | 'editor' | 'viewer',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        console.log('📋 Perfil processado e validado:', profile);
        return profile;
      }

      console.log('⚠️ Nenhum dado retornado da query profiles');
      return null;
    } catch (error) {
      console.error('💥 Erro inesperado na busca do perfil:', error);
      return null;
    }
  };

  const refetchProfile = async () => {
    if (user) {
      console.log('🔄 Refazendo busca do perfil para usuário:', user.id);
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('🔄 Perfil atualizado:', profile);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🚀 Iniciando useAuth...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) {
          console.log('🚫 Componente desmontado, ignorando evento auth');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário logado, iniciando busca do perfil...');
          try {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              console.log('✅ Definindo perfil no estado:', profile);
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('💥 Erro ao buscar perfil no auth state change:', error);
            if (mounted) {
              setUserProfile(null);
            }
          }
        } else {
          console.log('🚪 Usuário deslogado, limpando perfil');
          setUserProfile(null);
        }
        
        if (mounted) {
          console.log('⏰ Finalizando loading...');
          setLoading(false);
        }
      }
    );

    const getInitialSession = async () => {
      try {
        console.log('🔍 Buscando sessão inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão inicial:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        console.log('📋 Sessão inicial encontrada:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Sessão ativa encontrada, buscando perfil...');
          try {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              console.log('✅ Perfil carregado na inicialização:', profile);
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('💥 Erro ao buscar perfil na inicialização:', error);
            if (mounted) {
              setUserProfile(null);
            }
          }
        }
        
        if (mounted) {
          console.log('⏰ Finalizando loading da inicialização...');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao obter sessão inicial:', error);
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Limpando AuthProvider');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      refetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
