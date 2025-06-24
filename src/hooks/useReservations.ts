
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Reservation, CreateReservationData, UpdateReservationData } from '@/types/reservation';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      console.log('Iniciando busca de reservas...');
      setLoading(true);
      
      // Buscar reservas sem referências a outras tabelas para evitar problemas de RLS
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) {
        console.error('Erro detalhado ao buscar reservas:', error);
        toast({
          title: 'Erro',
          description: `Erro ao carregar reservas: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Reservas encontradas:', data?.length || 0);
      console.log('Dados das reservas:', data);
      
      // Garantir que os dados estão no formato correto
      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as 'pending' | 'confirmed' | 'cancelled',
        birthday: Boolean(reservation.birthday),
        people: Number(reservation.people)
      }));
      
      setReservations(typedReservations);
    } catch (error) {
      console.error('Erro na função fetchReservations:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar reservas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: CreateReservationData) => {
    try {
      console.log('Criando nova reserva:', reservationData);
      
      // Obter dados do usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        toast({
          title: 'Erro',
          description: 'Erro de autenticação.',
          variant: 'destructive',
        });
        return { data: null, error: userError };
      }
      
      const dataToInsert = {
        ...reservationData,
        created_by: userData.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Dados para inserção:', dataToInsert);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar reserva:', error);
        toast({
          title: 'Erro',
          description: `Erro ao criar reserva: ${error.message}`,
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      console.log('Reserva criada com sucesso:', data);
      
      const typedReservation = {
        ...data,
        status: data.status as 'pending' | 'confirmed' | 'cancelled',
        birthday: Boolean(data.birthday),
        people: Number(data.people)
      };
      
      setReservations(prev => [...prev, typedReservation]);
      toast({
        title: 'Sucesso!',
        description: 'Reserva criada com sucesso.',
      });
      
      return { data: typedReservation, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar reserva.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateReservation = async (id: string, updates: UpdateReservationData) => {
    try {
      console.log('Atualizando reserva:', id, updates);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const updateData = {
        ...updates,
        updated_by: userData.user?.id,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar reserva:', error);
        toast({
          title: 'Erro',
          description: `Erro ao atualizar reserva: ${error.message}`,
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      const typedReservation = {
        ...data,
        status: data.status as 'pending' | 'confirmed' | 'cancelled',
        birthday: Boolean(data.birthday),
        people: Number(data.people)
      };
      
      setReservations(prev => prev.map(r => r.id === id ? typedReservation : r));
      toast({
        title: 'Sucesso!',
        description: 'Reserva atualizada com sucesso.',
      });
      
      return { data: typedReservation, error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar reserva.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      console.log('Excluindo reserva:', id);
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir reserva:', error);
        toast({
          title: 'Erro',
          description: `Erro ao excluir reserva: ${error.message}`,
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
      console.error('Erro inesperado ao excluir reserva:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao excluir reserva.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  // Executar busca inicial
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
