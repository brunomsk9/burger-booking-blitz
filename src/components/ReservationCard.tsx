
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Phone, Edit, Trash2, MessageCircle, Check, X } from 'lucide-react';
import { Reservation } from '@/types/reservation';

interface ReservationCardProps {
  reservation: Reservation;
  onEdit: (reservation: Reservation) => void;
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (phone: string, customerName: string) => void;
  canUpdateReservations: boolean;
  canDeleteReservations: boolean;
  isViewer: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onEdit,
  onStatusChange,
  onDelete,
  onWhatsApp,
  canUpdateReservations,
  canDeleteReservations,
  isViewer,
}) => {
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
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{reservation.customer_name}</h3>
              <Badge className={getStatusColor(reservation.status)}>
                {getStatusText(reservation.status)}
              </Badge>
              {reservation.birthday && (
                <Badge variant="outline" className="bg-red-100 text-red-700">
                  🎂 {reservation.birthday_person_name ? `Aniversário: ${reservation.birthday_person_name}` : 'Aniversário'}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Franquia:</strong> {reservation.franchise_name}
              </div>
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <strong>Telefone:</strong> {reservation.phone}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <strong>Data/Hora:</strong> {new Date(reservation.date_time).toLocaleDateString('pt-BR')} às {new Date(reservation.date_time).toTimeString().slice(0, 5)}
              </div>
              <div>
                <strong>Pessoas:</strong> {reservation.people}
              </div>
              <div className="md:col-span-2">
                <strong>Personagens:</strong> {reservation.characters || 'Nenhum'}
              </div>
            </div>
          </div>
          
          {!isViewer && (
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onWhatsApp(reservation.phone, reservation.customer_name)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <MessageCircle size={16} className="mr-1" />
                WhatsApp
              </Button>
              
              {reservation.status === 'pending' && canUpdateReservations && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(reservation.id, 'approved')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check size={16} className="mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(reservation.id, 'confirmed')}
                  >
                    <Check size={16} className="mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onStatusChange(reservation.id, 'cancelled')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <X size={16} className="mr-1" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {canUpdateReservations && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(reservation)}
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </Button>
              )}
              
              {canDeleteReservations && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(reservation.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
