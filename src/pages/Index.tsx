
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ReservationManager from '@/components/ReservationManager';
import ReportsManager from '@/components/ReportsManager';
import GoogleCalendar from '@/components/GoogleCalendar';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
