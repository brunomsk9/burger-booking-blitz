
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, Utensils } from 'lucide-react';
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck';
import TimeSlotSelector from './TimeSlotSelector';
import ReservationFormFields from './ReservationFormFields';

const PublicReservation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { availableSlots, checkingAvailability, checkAvailability, clearAvailableSlots } = useAvailabilityCheck();
  
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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear time selection and slots when franchise or date changes
    if (updates.franchise_name !== undefined || updates.date !== undefined) {
      setFormData(prev => ({ ...prev, time: '', ...updates }));
      clearAvailableSlots();
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
      clearAvailableSlots();

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Utensils className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herois Burguer</h1>
          <p className="text-gray-600 text-lg">Solicite sua reserva para uma experiência inesquecível!</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-white border-b border-gray-100 pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Solicitar Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <ReservationFormFields 
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />

              <TimeSlotSelector
                selectedTime={formData.time}
                availableSlots={availableSlots}
                checkingAvailability={checkingAvailability}
                franchiseName={formData.franchise_name}
                date={formData.date}
                onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl shadow-lg transition-all duration-200"
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
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 text-center">
                  Sua reserva ficará pendente até a confirmação da nossa equipe. 
                  Entraremos em contato via WhatsApp em breve!
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicReservation;
