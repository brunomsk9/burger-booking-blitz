
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Phone, Edit, Trash2, Plus, MessageCircle, Loader2 } from 'lucide-react';
import { FRANCHISES } from '@/types';
import { useReservations, DatabaseReservation } from '@/hooks/useReservations';

const ReservationManager: React.FC = () => {
  const { reservations, loading, createReservation, updateReservation, deleteReservation } = useReservations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<DatabaseReservation | null>(null);
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
    
    const reservationData = {
      franchise_name: formData.franchise_name,
      customer_name: formData.customer_name,
      phone: formData.phone,
      date_time: formData.date_time,
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

  const handleEdit = (reservation: DatabaseReservation) => {
    setEditingReservation(reservation);
    setFormData({
      franchise_name: reservation.franchise_name,
      customer_name: reservation.customer_name,
      phone: reservation.phone,
      date_time: new Date(reservation.date_time).toISOString().slice(0, 16),
      people: reservation.people,
      birthday: reservation.birthday,
      birthday_person_name: reservation.birthday_person_name || '',
      characters: reservation.characters || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: DatabaseReservation['status']) => {
    await updateReservation(id, { status });
  };

  const handleDelete = async (id: string) => {
    await deleteReservation(id);
  };

  const handleWhatsApp = (phone: string, customerName: string) => {
    const message = `Olá ${customerName}! Este é um contato sobre sua reserva na Herois Burguer.`;
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando reservas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Reservas</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus size={16} className="mr-2" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="franchise_name">Franquia</Label>
                  <Select 
                    value={formData.franchise_name} 
                    onValueChange={(value) => setFormData({...formData, franchise_name: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a franquia" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRANCHISES.map(franchise => (
                        <SelectItem key={franchise} value={franchise}>
                          {franchise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer_name">Nome do Cliente</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="11999888777"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_time">Data e Hora</Label>
                  <Input
                    id="date_time"
                    type="datetime-local"
                    value={formData.date_time}
                    onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="people">Número de Pessoas</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    value={formData.people}
                    onChange={(e) => setFormData({...formData, people: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="birthday"
                    checked={formData.birthday}
                    onCheckedChange={(checked) => setFormData({...formData, birthday: Boolean(checked)})}
                  />
                  <Label htmlFor="birthday">É aniversário?</Label>
                </div>
              </div>
              
              {formData.birthday && (
                <div>
                  <Label htmlFor="birthday_person_name">Nome do Aniversariante</Label>
                  <Input
                    id="birthday_person_name"
                    value={formData.birthday_person_name}
                    onChange={(e) => setFormData({...formData, birthday_person_name: e.target.value})}
                    placeholder="Nome de quem está fazendo aniversário"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="characters">Personagens Solicitados</Label>
                <Textarea
                  id="characters"
                  value={formData.characters}
                  onChange={(e) => setFormData({...formData, characters: e.target.value})}
                  placeholder="Ex: Super-Homem, Batman, Mulher Maravilha..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingReservation ? 'Atualizar' : 'Criar'} Reserva
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{reservation.customer_name}</h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                    {reservation.birthday && (
                      <Badge variant="outline" className="bg-pink-100 text-pink-700">
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
                
                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(reservation.phone, reservation.customer_name)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <MessageCircle size={16} className="mr-1" />
                    WhatsApp
                  </Button>
                  
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(reservation)}
                  >
                    <Edit size={16} className="mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(reservation.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reservations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-gray-600">Crie sua primeira reserva clicando no botão "Nova Reserva".</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReservationManager;
