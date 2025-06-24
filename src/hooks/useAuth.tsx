
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil do usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        return null;
      }

      if (data) {
        console.log('✅ Perfil encontrado:', data);
        console.log('🎭 Role do usuário:', data.role);
        const profile = {
          ...data,
          role: data.role as 'superadmin' | 'admin' | 'editor' | 'viewer'
        };
        console.log('📋 Perfil processado:', profile);
        return profile;
      }

      console.log('⚠️ Nenhum perfil encontrado para o usuário');
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
    let mounted = true;
    console.log('🚀 Iniciando useEffect do AuthProvider');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) {
          console.log('⚠️ Componente desmontado, ignorando mudança de auth');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário logado, buscando perfil...');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            if (mounted) {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUserProfile(profile);
                console.log('✅ Estado atualizado - Profile:', profile);
                setLoading(false);
              }
            }
          }, 100); // Aumentei um pouco o timeout
        } else {
          console.log('🚪 Usuário deslogado');
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Buscando sessão inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão inicial:', error);
          setLoading(false);
          return;
        }
        
        if (!mounted) {
          console.log('⚠️ Componente desmontado durante busca de sessão');
          return;
        }
        
        console.log('📋 Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Sessão encontrada, buscando perfil...');
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
            console.log('✅ Perfil carregado na inicialização:', profile);
          }
        }
        
        if (mounted) {
          setLoading(false);
          console.log('✅ Loading finalizado');
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao obter sessão inicial:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Limpando AuthProvider');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Log sempre que o userProfile mudar
  useEffect(() => {
    console.log('🔄 UserProfile mudou:', userProfile);
  }, [userProfile]);

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
