
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Loader2, Search, X } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { usePermissions } from '@/hooks/usePermissions';
import { useCurrentUserFranchises } from '@/hooks/useCurrentUserFranchises';
import { useRealtimeReservations } from '@/hooks/useRealtimeReservations';
import { Reservation } from '@/types/reservation';
import TestConnection from './TestConnection';
import ReservationForm from './ReservationForm';
import ReservationCard from './ReservationCard';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, parseISO, startOfDay, endOfDay, addDays } from 'date-fns';

const ReservationManager: React.FC = () => {
  const { reservations, loading, createReservation, updateReservation, deleteReservation, refetch } = useReservations();
  
  // Hook para escutar novas reservas em tempo real
  useRealtimeReservations({
    onNewReservation: () => {
      refetch();
    }
  });
  const { 
    canCreateReservations, 
    canUpdateReservations, 
    canDeleteReservations,
    isViewer 
  } = usePermissions();
  const { franchises: userFranchises, loading: franchisesLoading } = useCurrentUserFranchises();
  
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

  // Filtros de pesquisa - pré-selecionar 7 dias
  const today = format(new Date(), 'yyyy-MM-dd');
  const sevenDaysLater = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  
  const [filterDateStart, setFilterDateStart] = useState(today);
  const [filterDateEnd, setFilterDateEnd] = useState(sevenDaysLater);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomerName, setFilterCustomerName] = useState('');

  // Aplicar filtros às reservas
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      // Filtro de data inicial
      if (filterDateStart) {
        const reservationDate = startOfDay(parseISO(reservation.date_time));
        const startDate = startOfDay(parseISO(filterDateStart));
        if (reservationDate < startDate) {
          return false;
        }
      }

      // Filtro de data final
      if (filterDateEnd) {
        const reservationDate = endOfDay(parseISO(reservation.date_time));
        const endDate = endOfDay(parseISO(filterDateEnd));
        if (reservationDate > endDate) {
          return false;
        }
      }

      // Filtro de status
      if (filterStatus !== 'all' && reservation.status !== filterStatus) {
        return false;
      }

      // Filtro de nome do cliente
      if (filterCustomerName && !reservation.customer_name.toLowerCase().includes(filterCustomerName.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [reservations, filterDateStart, filterDateEnd, filterStatus, filterCustomerName]);

  const clearFilters = () => {
    setFilterDateStart(today);
    setFilterDateEnd(sevenDaysLater);
    setFilterStatus('all');
    setFilterCustomerName('');
  };

  const hasActiveFilters = filterDateStart || filterDateEnd || filterStatus !== 'all' || filterCustomerName;

  // Pré-selecionar franquia do usuário quando abrir nova reserva
  useEffect(() => {
    console.log('🎯 useEffect pré-seleção franquia - Estado:', {
      isDialogOpen,
      editingReservation: !!editingReservation,
      franchisesLoading,
      userFranchisesCount: userFranchises.length,
      userFranchises
    });

    if (isDialogOpen && !editingReservation && !franchisesLoading && userFranchises.length > 0) {
      console.log('✅ Condições atendidas para pré-seleção');
      // Se o usuário tem apenas 1 franquia, pré-selecionar automaticamente
      if (userFranchises.length === 1) {
        console.log('🎯 Pré-selecionando franquia:', userFranchises[0].displayName);
        setFormData(prev => ({
          ...prev,
          franchise_name: userFranchises[0].displayName
        }));
      } else {
        console.log('ℹ️ Usuário tem', userFranchises.length, 'franquias. Não pré-selecionando.');
      }
    } else {
      console.log('⚠️ Condições NÃO atendidas para pré-seleção');
    }
  }, [isDialogOpen, editingReservation, franchisesLoading, userFranchises]);

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

      {/* Filtros de Pesquisa */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filtros de Pesquisa</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Data Início */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filtro por Data Fim */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Nome do Cliente */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cliente</label>
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={filterCustomerName}
                  onChange={(e) => setFilterCustomerName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                {filteredReservations.length} de {reservations.length} reserva(s) encontrada(s)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ReservationForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingReservation={editingReservation}
        userFranchises={userFranchises}
      />

      <div className="grid gap-4">
        {filteredReservations.map((reservation) => (
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
        
        {filteredReservations.length === 0 && reservations.length > 0 && (
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-gray-600 mb-4">
                Não há reservas que correspondam aos filtros aplicados.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
        
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
