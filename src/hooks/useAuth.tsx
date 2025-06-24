
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
  const { user, session, loading: authLoading } = useAuthState();
  const { userProfile, profileLoading, refetchProfile } = useUserProfile(user);

  const loading = authLoading || profileLoading;

  console.log('🏠 AuthProvider - Estado atual:', {
    user: user?.email,
    userProfile: userProfile?.name,
    role: userProfile?.role,
    authLoading,
    profileLoading,
    totalLoading: loading
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
          full_name: name,
          display_name: name
        },
        emailSubject: '🦸 Confirme seu acesso ao Sistema Herois Burguer',
        emailBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background-color: #dc2626; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                🦸
              </div>
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Herois Burguer</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestão de Reservas</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #333; margin-top: 0; font-size: 20px;">Olá, ${name}! 👋</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Você foi convidado(a) para acessar o <strong>Sistema de Gestão de Reservas do Herois Burguer</strong>. 
                Para ativar sua conta e começar a usar o sistema, clique no botão abaixo:
              </p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="{{.ConfirmationURL}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                  ✅ Ativar Minha Conta
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <strong>O que você poderá fazer no sistema:</strong><br>
                • Visualizar e gerenciar reservas<br>
                • Confirmar ou cancelar reservas<br>
                • Entrar em contato com clientes via WhatsApp<br>
                • Acompanhar relatórios e estatísticas
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Este link de ativação expira em 24 horas. Se não conseguir ativar sua conta a tempo, entre em contato com o administrador do sistema.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Este email foi enviado pelo Sistema Herois Burguer</p>
              <p>Se você não solicitou este cadastro, pode ignorar este email com segurança.</p>
            </div>
          </div>
        `
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
