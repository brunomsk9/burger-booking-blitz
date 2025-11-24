
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useAvailabilityCheck = () => {
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

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

      // Criar início e fim do dia no timezone de Brasília
      const startOfDay = fromZonedTime(`${date}T00:00:00`, 'America/Sao_Paulo');
      const endOfDay = fromZonedTime(`${date}T23:59:59`, 'America/Sao_Paulo');

      // Buscar reservas existentes para a franquia e data selecionada
      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('date_time')
        .eq('franchise_name', franchise)
        .gte('date_time', startOfDay.toISOString())
        .lt('date_time', endOfDay.toISOString())
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

      // Extrair horários ocupados convertendo para timezone de Brasília
      const occupiedTimes = (existingReservations || []).map(reservation => {
        const brasiliaDate = toZonedTime(new Date(reservation.date_time), 'America/Sao_Paulo');
        return format(brasiliaDate, 'HH:mm');
      });

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

  const clearAvailableSlots = () => {
    setAvailableSlots([]);
  };

  return {
    availableSlots,
    checkingAvailability,
    checkAvailability,
    clearAvailableSlots
  };
};
