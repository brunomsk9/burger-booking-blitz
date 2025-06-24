
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DatabaseReservation } from '@/hooks/useReservations';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  franchiseName?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | '';
}

export interface ReportData {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  totalPeople: number;
  birthdayReservations: number;
  reservationsByFranchise: { [key: string]: number };
  reservationsByDay: { [key: string]: number };
  reservations: DatabaseReservation[];
}

export const useReports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalReservations: 0,
    confirmedReservations: 0,
    pendingReservations: 0,
    cancelledReservations: 0,
    totalPeople: 0,
    birthdayReservations: 0,
    reservationsByFranchise: {},
    reservationsByDay: {},
    reservations: [],
  });
  const [loading, setLoading] = useState(true);

  const generateReport = async (filters: ReportFilters = {}) => {
    try {
      console.log('Gerando relatório com filtros:', filters);
      setLoading(true);
      
      let query = supabase
        .from('reservations')
        .select('*')
        .order('date_time', { ascending: true });

      if (filters.startDate) {
        query = query.gte('date_time', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('date_time', filters.endDate);
      }
      
      if (filters.franchiseName) {
        query = query.eq('franchise_name', filters.franchiseName);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao gerar relatório:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível gerar o relatório.',
          variant: 'destructive',
        });
        return;
      }
      
      const reservations = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as 'pending' | 'confirmed' | 'cancelled'
      }));
      
      // Calcular estatísticas
      const totalReservations = reservations.length;
      const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
      const pendingReservations = reservations.filter(r => r.status === 'pending').length;
      const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
      const totalPeople = reservations.reduce((sum, r) => sum + r.people, 0);
      const birthdayReservations = reservations.filter(r => r.birthday).length;
      
      // Reservas por franquia
      const reservationsByFranchise: { [key: string]: number } = {};
      reservations.forEach(r => {
        reservationsByFranchise[r.franchise_name] = (reservationsByFranchise[r.franchise_name] || 0) + 1;
      });
      
      // Reservas por dia
      const reservationsByDay: { [key: string]: number } = {};
      reservations.forEach(r => {
        const date = new Date(r.date_time).toLocaleDateString('pt-BR');
        reservationsByDay[date] = (reservationsByDay[date] || 0) + 1;
      });

      setReportData({
        totalReservations,
        confirmedReservations,
        pendingReservations,
        cancelledReservations,
        totalPeople,
        birthdayReservations,
        reservationsByFranchise,
        reservationsByDay,
        reservations,
      });
      
      console.log('Relatório gerado com sucesso:', {
        totalReservations,
        confirmedReservations,
        pendingReservations,
        cancelledReservations
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  return {
    reportData,
    loading,
    generateReport,
  };
};
