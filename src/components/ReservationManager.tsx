
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { usePermissions } from '@/hooks/usePermissions';
import { Reservation } from '@/types/reservation';
import TestConnection from './TestConnection';
import ReservationForm from './ReservationForm';
import ReservationCard from './ReservationCard';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

const ReservationManager: React.FC = () => {
  const { reservations, loading, createReservation, updateReservation, deleteReservation } = useReservations();
  const { 
    canCreateReservations, 
    canUpdateReservations, 
    canDeleteReservations,
    isViewer 
  } = usePermissions();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [formData, setFormData] = useState({
    franchise_name: '',
    customer_name: '',
    phone: '',
    date_time: '',
    people: 1,
    birthday: false,
    birthday_person_name: '',
    characters: ''
  });

  const resetForm = () => {
    setFormData({
      franchise_name: '',
      customer_name: '',
      phone: '',
      date_time: '',
      people: 1,
      birthday: false,
      birthday_person_name: '',
      characters: ''
    });
    setEditingReservation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter data do formulário para timezone de Brasília
    const brasiliaDate = fromZonedTime(formData.date_time, 'America/Sao_Paulo');
    
    const reservationData = {
      franchise_name: formData.franchise_name,
      customer_name: formData.customer_name,
      phone: formData.phone,
      date_time: brasiliaDate.toISOString(),
      people: formData.people,
      birthday: formData.birthday,
      birthday_person_name: formData.birthday_person_name,
      characters: formData.characters,
      status: editingReservation?.status || 'pending' as const,
    };

    if (editingReservation) {
      await updateReservation(editingReservation.id, reservationData);
    } else {
      await createReservation(reservationData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    const brasiliaDate = toZonedTime(new Date(reservation.date_time), 'America/Sao_Paulo');
    setFormData({
      franchise_name: reservation.franchise_name,
      customer_name: reservation.customer_name,
      phone: reservation.phone,
      date_time: format(brasiliaDate, "yyyy-MM-dd'T'HH:mm"),
      people: reservation.people,
      birthday: reservation.birthday,
      birthday_person_name: reservation.birthday_person_name || '',
      characters: reservation.characters || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    await updateReservation(id, { status });
  };

  const handleDelete = async (id: string) => {
    await deleteReservation(id);
  };

  const handleWhatsApp = (phone: string, customerName: string) => {
    const message = `Olá ${customerName}! Este é um contato sobre sua reserva na reservaja.`;
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando reservas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Reservas</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Ocultar' : 'Debug'}
          </Button>
          {canCreateReservations() && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Nova Reserva
            </Button>
          )}
        </div>
      </div>

      {isViewer() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            🔍 <strong>Modo Visualização:</strong> Você pode visualizar as reservas, mas não pode criar ou modificar.
          </p>
        </div>
      )}

      {showDebug && (
        <TestConnection />
      )}

      <ReservationForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingReservation={editingReservation}
      />

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onWhatsApp={handleWhatsApp}
            canUpdateReservations={canUpdateReservations()}
            canDeleteReservations={canDeleteReservations()}
            isViewer={isViewer()}
          />
        ))}
        
        {reservations.length === 0 && (
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-gray-600">
                {canCreateReservations() 
                  ? 'Crie sua primeira reserva clicando no botão "Nova Reserva".'
                  : 'Nenhuma reserva foi criada ainda.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReservationManager;
