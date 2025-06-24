
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Calendar, Phone, Edit, Trash2, Plus, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Reservation, CHARACTERS, FRANCHISES } from '@/types';

const ReservationManager: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      franchiseName: 'Burger Central - Shopping',
      customerName: 'João Silva',
      phone: '11999888777',
      dateTime: new Date('2024-06-25T19:00:00'),
      people: 4,
      birthday: true,
      characters: ['Ronald McDonald', 'Chef Burger'],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      franchiseName: 'Burger Central - Centro',
      customerName: 'Maria Santos',
      phone: '11888777666',
      dateTime: new Date('2024-06-25T20:30:00'),
      people: 2,
      birthday: false,
      characters: ['Hambúrguer'],
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    franchiseName: '',
    customerName: '',
    phone: '',
    dateTime: '',
    people: 1,
    birthday: false,
    characters: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      franchiseName: '',
      customerName: '',
      phone: '',
      dateTime: '',
      people: 1,
      birthday: false,
      characters: []
    });
    setEditingReservation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reservation: Reservation = {
      id: editingReservation?.id || Date.now().toString(),
      franchiseName: formData.franchiseName,
      customerName: formData.customerName,
      phone: formData.phone,
      dateTime: new Date(formData.dateTime),
      people: formData.people,
      birthday: formData.birthday,
      characters: formData.characters,
      status: editingReservation?.status || 'pending',
      createdAt: editingReservation?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingReservation) {
      setReservations(prev => prev.map(r => r.id === editingReservation.id ? reservation : r));
      toast({ title: 'Reserva atualizada com sucesso!' });
    } else {
      setReservations(prev => [...prev, reservation]);
      toast({ title: 'Reserva criada com sucesso!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      franchiseName: reservation.franchiseName,
      customerName: reservation.customerName,
      phone: reservation.phone,
      dateTime: reservation.dateTime.toISOString().slice(0, 16),
      people: reservation.people,
      birthday: reservation.birthday,
      characters: reservation.characters
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status, updatedAt: new Date() } : r
    ));
    toast({ 
      title: `Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'}!` 
    });
  };

  const handleDelete = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Reserva excluída com sucesso!' });
  };

  const handleWhatsApp = (phone: string, customerName: string) => {
    const message = `Olá ${customerName}! Este é um contato sobre sua reserva na Burger Central.`;
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
                  <Label htmlFor="franchiseName">Franquia</Label>
                  <Select 
                    value={formData.franchiseName} 
                    onValueChange={(value) => setFormData({...formData, franchiseName: value})}
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
                  <Label htmlFor="customerName">Nome do Cliente</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
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
                  <Label htmlFor="dateTime">Data e Hora</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
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
              
              <div>
                <Label>Personagens Solicitados</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {CHARACTERS.map(character => (
                    <div key={character} className="flex items-center space-x-2">
                      <Checkbox
                        id={character}
                        checked={formData.characters.includes(character)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              characters: [...formData.characters, character]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              characters: formData.characters.filter(c => c !== character)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={character} className="text-sm">{character}</Label>
                    </div>
                  ))}
                </div>
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
                    <h3 className="text-lg font-semibold">{reservation.customerName}</h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                    {reservation.birthday && (
                      <Badge variant="outline" className="bg-pink-100 text-pink-700">
                        🎂 Aniversário
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Franquia:</strong> {reservation.franchiseName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <strong>Telefone:</strong> {reservation.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <strong>Data/Hora:</strong> {reservation.dateTime.toLocaleDateString('pt-BR')} às {reservation.dateTime.toTimeString().slice(0, 5)}
                    </div>
                    <div>
                      <strong>Pessoas:</strong> {reservation.people}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Personagens:</strong> {reservation.characters.join(', ') || 'Nenhum'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(reservation.phone, reservation.customerName)}
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
      </div>
    </div>
  );
};

export default ReservationManager;
