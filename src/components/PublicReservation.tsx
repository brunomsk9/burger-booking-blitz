
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, Utensils } from 'lucide-react';
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck';
import { useFranchiseTheme } from '@/hooks/useFranchiseTheme';
import TimeSlotSelector from './TimeSlotSelector';
import PublicReservationFormFields from './PublicReservationFormFields';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface PublicReservationProps {
  preselectedFranchise?: string;
  franchiseSlug?: string;
}

const PublicReservation: React.FC<PublicReservationProps> = ({ 
  preselectedFranchise,
  franchiseSlug 
}) => {
  const [loading, setLoading] = useState(false);
  const { availableSlots, checkingAvailability, checkAvailability, clearAvailableSlots } = useAvailabilityCheck();
  // Usar o slug se disponível, caso contrário usar o preselectedFranchise
  const { theme, loading: themeLoading } = useFranchiseTheme(franchiseSlug || preselectedFranchise);
  
  const [formData, setFormData] = useState({
    franchise_name: preselectedFranchise || '',
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
    if (preselectedFranchise && formData.franchise_name !== preselectedFranchise) {
      setFormData(prev => ({ ...prev, franchise_name: preselectedFranchise }));
    }
  }, [preselectedFranchise]);

  useEffect(() => {
    if (formData.franchise_name && formData.date) {
      checkAvailability(formData.franchise_name, formData.date);
    }
  }, [formData.franchise_name, formData.date]);

  const notifyWhatsApp = async (reservationData: any) => {
    try {
      console.log('Enviando notificação WhatsApp...');
      
      const { error } = await supabase.functions.invoke('notify-whatsapp-reservation', {
        body: {
          type: 'INSERT',
          table: 'reservations',
          record: reservationData
        }
      });

      if (error) {
        console.error('Erro ao enviar notificação WhatsApp:', error);
      } else {
        console.log('Notificação WhatsApp enviada com sucesso');
      }
    } catch (error) {
      console.error('Erro inesperado ao enviar WhatsApp:', error);
    }
  };

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
      // Criar data no timezone de Brasília
      const localDateTime = `${formData.date}T${formData.time}:00`;
      const brasiliaDate = fromZonedTime(localDateTime, 'America/Sao_Paulo');
      
      const reservationData = {
        franchise_name: formData.franchise_name,
        customer_name: formData.customer_name,
        phone: formData.phone,
        date_time: brasiliaDate.toISOString(),
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

      // Enviar notificação WhatsApp
      await notifyWhatsApp(data);

      toast({
        title: 'Reserva solicitada com sucesso! 🎉',
        description: 'Sua reserva foi registrada e está pendente de confirmação. Entraremos em contato em breve!',
      });

      // Limpar formulário
      setFormData({
        franchise_name: preselectedFranchise || '',
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

  if (themeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        backgroundColor: `${theme.primaryColor}08`,
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-6">
            {theme.logoUrl ? (
              <img 
                src={theme.logoUrl} 
                alt="Logo" 
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Utensils className="h-8 w-8" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {preselectedFranchise || 'reservaja'}
          </h1>
          <p className="text-gray-600 text-lg">Solicite sua reserva para uma experiência inesquecível!</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader 
            className="border-b pb-6"
            style={{ 
              backgroundColor: `${theme.primaryColor}12`,
              borderBottomColor: `${theme.primaryColor}30`
            }}
          >
            <CardTitle 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: theme.secondaryColor }}
            >
              <Calendar className="h-5 w-5" style={{ color: theme.accentColor }} />
              Solicitar Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PublicReservationFormFields 
                formData={formData}
                onFormDataChange={handleFormDataChange}
                disableFranchiseSelect={!!preselectedFranchise}
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
                  className="w-full text-white text-lg py-6 rounded-xl shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: theme.primaryColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.secondaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryColor;
                  }}
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

              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: `${theme.accentColor}15`,
                  borderColor: `${theme.accentColor}40`
                }}
              >
                <p 
                  className="text-sm text-center"
                  style={{ color: theme.secondaryColor }}
                >
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
