
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total de Reservas',
      value: '156',
      change: '+12%',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Confirmadas',
      value: '89',
      change: '+8%',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Pendentes',
      value: '34',
      change: '+5%',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Canceladas',
      value: '33',
      change: '-3%',
      icon: XCircle,
      color: 'bg-red-500'
    }
  ];

  const recentReservations = [
    {
      id: '1',
      customerName: 'João Silva',
      franchiseName: 'Herois Burguer - Shopping',
      dateTime: '2024-06-25 19:00',
      people: 4,
      status: 'pending' as const
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      franchiseName: 'Herois Burguer - Centro',
      dateTime: '2024-06-25 20:30',
      people: 2,
      status: 'confirmed' as const
    },
    {
      id: '3',
      customerName: 'Pedro Costa',
      franchiseName: 'Herois Burguer - Zona Norte',
      dateTime: '2024-06-26 18:00',
      people: 6,
      status: 'pending' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
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
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema Herois Burguer! 🦸‍♂️</h1>
        <p className="text-red-100">Gerencie suas reservas de forma simples e eficiente.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Reservas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{reservation.customerName}</h4>
                  <p className="text-sm text-gray-600">{reservation.franchiseName}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{reservation.dateTime}</span>
                    <span>{reservation.people} pessoas</span>
                  </div>
                </div>
                <Badge className={getStatusColor(reservation.status)}>
                  {getStatusText(reservation.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
