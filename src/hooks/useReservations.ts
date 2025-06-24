
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DatabaseReservation {
  id: string;
  franchise_name: string;
  customer_name: string;
  phone: string;
  date_time: string;
  people: number;
  birthday: boolean;
  birthday_person_name?: string;
  characters?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<DatabaseReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
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

  const createReservation = async (reservation: Omit<DatabaseReservation, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservation,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setReservations(prev => [...prev, data]);
      toast({
        title: 'Sucesso!',
        description: 'Reserva criada com sucesso.',
      });
      
      return { data, error: null };
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

  const updateReservation = async (id: string, updates: Partial<DatabaseReservation>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setReservations(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: 'Sucesso!',
        description: 'Reserva atualizada com sucesso.',
      });
      
      return { data, error: null };
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
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
