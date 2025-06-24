
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Reservation, CreateReservationData, UpdateReservationData } from '@/types/reservation';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      console.log('Buscando reservas...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) {
        console.error('Erro ao buscar reservas:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as reservas.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Reservas carregadas:', data?.length || 0);
      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as 'pending' | 'confirmed' | 'cancelled'
      }));
      
      setReservations(typedReservations);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as reservas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: CreateReservationData) => {
    try {
      console.log('Criando reserva:', reservationData);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const dataToInsert = {
        ...reservationData,
        created_by: userData.user?.id,
      };
      
      console.log('Dados da reserva para inserir:', dataToInsert);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar reserva:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a reserva.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      console.log('Reserva criada com sucesso:', data);
      
      const typedReservation = {
        ...data,
        status: data.status as 'pending' | 'confirmed' | 'cancelled'
      };
      
      setReservations(prev => [...prev, typedReservation]);
      toast({
        title: 'Sucesso!',
        description: 'Reserva criada com sucesso.',
      });
      
      return { data: typedReservation, error: null };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a reserva.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateReservation = async (id: string, updates: UpdateReservationData) => {
    try {
      console.log('Atualizando reserva:', id, updates);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_by: userData.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar reserva:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a reserva.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      const typedReservation = {
        ...data,
        status: data.status as 'pending' | 'confirmed' | 'cancelled'
      };
      
      setReservations(prev => prev.map(r => r.id === id ? typedReservation : r));
      toast({
        title: 'Sucesso!',
        description: 'Reserva atualizada com sucesso.',
      });
      
      return { data: typedReservation, error: null };
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a reserva.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      console.log('Deletando reserva:', id);
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir reserva:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a reserva.',
          variant: 'destructive',
        });
        return { error };
      }
      
      setReservations(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Sucesso!',
        description: 'Reserva excluída com sucesso.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a reserva.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    createReservation,
    updateReservation,
    deleteReservation,
    refetch: fetchReservations,
  };
};
