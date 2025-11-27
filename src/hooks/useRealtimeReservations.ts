import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/types/reservation';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeReservationsProps {
  onNewReservation?: (reservation: Reservation) => void;
}

export const useRealtimeReservations = ({ onNewReservation }: UseRealtimeReservationsProps = {}) => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          const newReservation = payload.new as Reservation;
          
          // Mostra notificação toast
          toast({
            title: '🎉 Nova Reserva Criada!',
            description: `${newReservation.customer_name} - ${newReservation.franchise_name}`,
            duration: 5000,
          });

          // Callback opcional
          if (onNewReservation) {
            onNewReservation(newReservation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewReservation, toast]);
};
