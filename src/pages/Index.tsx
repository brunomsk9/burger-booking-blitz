
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/components/AuthPage';
import Layout from '@/components/Layout';

const Index = () => {
  const { user, loading } = useAuth();

  console.log('Index - Loading:', loading, 'User:', user?.email);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg animate-pulse">
            🦸
          </div>
          <p className="text-lg text-gray-600">Carregando...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    console.log('Usuário não autenticado, mostrando página de login');
    return <AuthPage />;
  }

  console.log('Usuário autenticado, mostrando aplicação');

  return <Layout />;
};

export default Index;
