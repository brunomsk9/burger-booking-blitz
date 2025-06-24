
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FRANCHISES } from '@/types';
import { Calendar, Clock, Phone, User, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

const PublicReservation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({
    franchise_name: '',
    customer_name: '',
    phone: '',
    date: '',
    time: '',
    people: 1,
    birthday: false,
    birthday_person_name: '',
    characters: ''
  });

  // Horários padrão de funcionamento
  const standardSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const checkAvailability = async (franchise: string, date: string) => {
    if (!franchise || !date) return;

    setCheckingAvailability(true);
    try {
      console.log('Verificando disponibilidade para:', franchise, date);

      // Buscar reservas existentes para a franquia e data selecionada
      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('date_time')
        .eq('franchise_name', franchise)
        .gte('date_time', `${date}T00:00:00`)
        .lt('date_time', `${date}T23:59:59`)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao verificar disponibilidade. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      // Extrair horários ocupados
      const occupiedTimes = (existingReservations || []).map(reservation => 
        new Date(reservation.date_time).toTimeString().slice(0, 5)
      );

      // Criar lista de horários com disponibilidade
      const slots: TimeSlot[] = standardSlots.map(time => ({
        time,
        available: !occupiedTimes.includes(time)
      }));

      setAvailableSlots(slots);
      console.log('Horários disponíveis:', slots);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao verificar disponibilidade.',
        variant: 'destructive',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (formData.franchise_name && formData.date) {
      checkAvailability(formData.franchise_name, formData.date);
    }
  }, [formData.franchise_name, formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.time) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um horário.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const dateTime = `${formData.date}T${formData.time}:00`;
      
      const reservationData = {
        franchise_name: formData.franchise_name,
        customer_name: formData.customer_name,
        phone: formData.phone,
        date_time: dateTime,
        people: formData.people,
        birthday: formData.birthday,
        birthday_person_name: formData.birthday_person_name,
        characters: formData.characters,
        status: 'pending' as const,
      };

      console.log('Criando reserva pública:', reservationData);

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar reserva:', error);
        toast({
          title: 'Erro',
          description: `Erro ao criar reserva: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Reserva solicitada com sucesso! 🎉',
        description: 'Sua reserva foi registrada e está pendente de confirmação. Entraremos em contato em breve!',
      });

      // Limpar formulário
      setFormData({
        franchise_name: '',
        customer_name: '',
        phone: '',
        date: '',
        time: '',
        people: 1,
        birthday: false,
        birthday_person_name: '',
        characters: ''
      });
      setAvailableSlots([]);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar reserva.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = availableSlots.find(slot => slot.time === formData.time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-red-600 text-4xl font-bold">
              🦸
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Herois Burguer</h1>
          <p className="text-red-100 text-lg">Solicite sua reserva para uma experiência inesquecível!</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="bg-red-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Solicitar Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="franchise_name" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Franquia
                  </Label>
                  <Select 
                    value={formData.franchise_name} 
                    onValueChange={(value) => {
                      setFormData({...formData, franchise_name: value, time: ''});
                      setAvailableSlots([]);
                    }}
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
                  <Label htmlFor="customer_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Seu Nome
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="11999888777"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="people">Número de Pessoas</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.people}
                    onChange={(e) => setFormData({...formData, people: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Data da Reserva</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({...formData, date: e.target.value, time: ''});
                      setAvailableSlots([]);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário
                    {checkingAvailability && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => setFormData({...formData, time: value})}
                    disabled={!formData.franchise_name || !formData.date || checkingAvailability}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.franchise_name || !formData.date 
                          ? "Selecione franquia e data primeiro" 
                          : "Selecione o horário"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem 
                          key={slot.time} 
                          value={slot.time}
                          disabled={!slot.available}
                          className={!slot.available ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center gap-2">
                            {slot.available ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {slot.time} {!slot.available && '(Ocupado)'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSlot && selectedSlot.available && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Horário disponível!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="birthday"
                  checked={formData.birthday}
                  onCheckedChange={(checked) => setFormData({...formData, birthday: Boolean(checked)})}
                />
                <Label htmlFor="birthday" className="text-lg">🎂 É uma festa de aniversário?</Label>
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
                <Label htmlFor="characters">Personagens que gostaria de ver (opcional)</Label>
                <Textarea
                  id="characters"
                  value={formData.characters}
                  onChange={(e) => setFormData({...formData, characters: e.target.value})}
                  placeholder="Ex: Super-Homem, Batman, Mulher Maravilha..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                disabled={loading || !selectedSlot?.available}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando Solicitação...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-5 w-5" />
                    Solicitar Reserva
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                Sua reserva ficará pendente até a confirmação da nossa equipe. 
                Entraremos em contato via WhatsApp em breve!
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicReservation;
