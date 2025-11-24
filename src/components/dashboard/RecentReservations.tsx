
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RecentReservation {
  id: string;
  customer_name: string;
  franchise_name: string;
  date_time: string;
  people: number;
  status: 'pending' | 'approved' | 'confirmed' | 'cancelled';
}

interface RecentReservationsProps {
  reservations: RecentReservation[];
  loading: boolean;
}

const RecentReservations: React.FC<RecentReservationsProps> = ({ reservations, loading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Calendar size={20} />
          Reservas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando...</p>
            </div>
          ) : reservations.length > 0 ? (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{reservation.customer_name}</h4>
                  <p className="text-sm text-gray-600">{reservation.franchise_name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{reservation.date_time.slice(8,10)}/{reservation.date_time.slice(5,7)}/{reservation.date_time.slice(0,4)} às {reservation.date_time.slice(11,16)}</span>
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
  );
};

export default RecentReservations;
