
import React, { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from './dashboard/StatsCard';
import RecentReservations from './dashboard/RecentReservations';

interface DashboardStats {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
}

interface RecentReservation {
  id: string;
  customer_name: string;
  franchise_name: string;
  date_time: string;
  people: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    confirmedReservations: 0,
    pendingReservations: 0,
    cancelledReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Carregando dados do dashboard...');
      setLoading(true);
      
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        return;
      }

      console.log('Dados carregados:', reservations?.length || 0, 'reservas');

      const totalReservations = reservations?.length || 0;
      const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;
      const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
      const cancelledReservations = reservations?.filter(r => r.status === 'cancelled').length || 0;

      setStats({
        totalReservations,
        confirmedReservations,
        pendingReservations,
        cancelledReservations,
      });

      const recent = reservations?.slice(0, 5).map(r => ({
        id: r.id,
        customer_name: r.customer_name,
        franchise_name: r.franchise_name,
        date_time: r.date_time,
        people: r.people,
        status: r.status as 'pending' | 'confirmed' | 'cancelled',
      })) || [];

      setRecentReservations(recent);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema Herois Burguer! 🦸‍♂️</h1>
        <p className="text-blue-100">Gerencie suas reservas de forma simples e eficiente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Reservas"
          value={stats.totalReservations}
          subtitle="Total"
          icon={<Calendar />}
          color="blue"
        />

        <StatsCard
          title="Confirmadas"
          value={stats.confirmedReservations}
          subtitle="Ativas"
          icon={<CheckCircle />}
          color="blue"
        />

        <StatsCard
          title="Pendentes"
          value={stats.pendingReservations}
          subtitle="Aguardando"
          icon={<Clock />}
          color="red"
        />

        <StatsCard
          title="Canceladas"
          value={stats.cancelledReservations}
          subtitle="Total"
          icon={<XCircle />}
          color="gray"
        />
      </div>

      <RecentReservations reservations={recentReservations} loading={loading} />
    </div>
  );
};

export default Dashboard;
