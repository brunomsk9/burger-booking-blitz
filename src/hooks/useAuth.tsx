
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
      console.log('🔍 Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 Resultado da query:', { data, error });

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

      console.log('⚠️ Nenhum perfil encontrado');
      return null;
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
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

  // Efeito separado para buscar perfil quando o usuário muda
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (user && isMounted) {
        console.log('👤 Carregando perfil para usuário:', user.id);
        const profile = await fetchUserProfile(user.id);
        if (isMounted) {
          setUserProfile(profile);
          setLoading(false);
        }
      } else if (!user && isMounted) {
        console.log('🚪 Usuário deslogado, limpando estado');
        setUserProfile(null);
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    console.log('🚀 Iniciando useAuth...');

    // Auth state listener - apenas atualiza user e session, SEM buscar perfil aqui
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) {
          console.log('🚫 Componente desmontado, ignorando evento');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        // NÃO buscar perfil aqui - será feito no useEffect separado
      }
    );

    // Buscar sessão inicial
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
        
        console.log('📋 Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        // O perfil será buscado pelo useEffect separado
      } catch (error) {
        console.error('💥 Erro inesperado:', error);
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
