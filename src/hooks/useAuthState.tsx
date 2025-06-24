
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log('🚀 useAuthState - Iniciando...');

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) {
          console.log('🚫 Componente desmontado, ignorando evento');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se não há sessão, parar o loading
        if (!session) {
          setLoading(false);
        }
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
        
        console.log('📋 Sessão inicial encontrada:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se não há sessão, parar o loading
        if (!session) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao buscar sessão:', error);
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 Limpando useAuthState');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading, setLoading };
};
