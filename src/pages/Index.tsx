
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/components/AuthPage';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ReservationManager from '@/components/ReservationManager';
import ReportsManager from '@/components/ReportsManager';
import GoogleCalendar from '@/components/GoogleCalendar';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            🦸
          </div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservations':
        return <ReservationManager />;
      case 'users':
        return <div className="p-6"><h2 className="text-2xl font-bold">Usuários - Em desenvolvimento</h2></div>;
      case 'reports':
        return <ReportsManager />;
      case 'calendar':
        return <GoogleCalendar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
