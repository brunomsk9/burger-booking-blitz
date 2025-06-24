
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { useAuthState } from './useAuthState';
import { useUserProfile } from './useUserProfile';

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
  const { user, session, loading, setLoading } = useAuthState();
  const { userProfile, refetchProfile } = useUserProfile(user, setLoading);

  console.log('🏠 AuthProvider - Estado atual:', {
    user: user?.email,
    userProfile: userProfile?.name,
    role: userProfile?.role,
    loading
  });

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentando fazer login...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('🔑 Resultado do login:', error ? 'Erro' : 'Sucesso');
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('📝 Tentando fazer cadastro...');
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
    console.log('📝 Resultado do cadastro:', error ? 'Erro' : 'Sucesso');
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
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
