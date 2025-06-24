
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar estatísticas
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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

      // Últimas 5 reservas - properly type the status field
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema Herois Burguer! 🦸‍♂️</h1>
        <p className="text-blue-100">Gerencie suas reservas de forma simples e eficiente.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalReservations}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Hoje</span>
                </div>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.confirmedReservations}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Ativas</span>
                </div>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-red-600">{stats.pendingReservations}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-red-500 mr-1" />
                  <span className="text-sm text-red-600">Aguardando</span>
                </div>
              </div>
              <div className="bg-red-500 p-3 rounded-full">
                <Clock size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-3xl font-bold text-gray-600">{stats.cancelledReservations}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">Total</span>
                </div>
              </div>
              <div className="bg-gray-500 p-3 rounded-full">
                <XCircle size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar size={20} />
            Reservas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{reservation.customer_name}</h4>
                    <p className="text-sm text-gray-600">{reservation.franchise_name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(reservation.date_time).toLocaleDateString('pt-BR')} às {new Date(reservation.date_time).toTimeString().slice(0, 5)}</span>
                      <span>{reservation.people} pessoas</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(reservation.status)}>
                    {getStatusText(reservation.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Nenhuma reserva encontrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
