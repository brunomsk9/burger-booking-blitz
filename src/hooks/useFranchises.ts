
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Franchise {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  active: boolean;
  created_at: string;
}

export const useFranchises = () => {
  const { data: franchises, isLoading, error, refetch } = useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      console.log('Buscando franquias...');
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar franquias:', error);
        throw error;
      }

      console.log('Franquias encontradas:', data);
      return data as Franchise[];
    },
  });

  return {
    franchises: franchises || [],
    loading: isLoading,
    error,
    refetch,
  };
};
