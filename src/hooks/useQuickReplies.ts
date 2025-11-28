import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuickReply {
  id: string;
  franchise_id: string;
  title: string;
  message: string;
  shortcut: string | null;
  created_at: string;
  updated_at: string;
}

export const useQuickReplies = (franchiseId: string | null) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuickReplies = async () => {
    if (!franchiseId) {
      setQuickReplies([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_quick_replies')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('title', { ascending: true });

      if (error) throw error;

      setQuickReplies((data || []) as QuickReply[]);
    } catch (error) {
      console.error('Erro ao carregar respostas rápidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as respostas rápidas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuickReply = async (data: Omit<QuickReply, 'id' | 'created_at' | 'updated_at'>) => {
    if (!franchiseId) return;

    try {
      const { error } = await supabase
        .from('whatsapp_quick_replies')
        .insert(data);

      if (error) throw error;

      toast({
        title: 'Resposta rápida criada',
        description: 'A resposta rápida foi criada com sucesso',
      });

      await fetchQuickReplies();
    } catch (error) {
      console.error('Erro ao criar resposta rápida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a resposta rápida',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateQuickReply = async (id: string, data: Partial<Omit<QuickReply, 'id' | 'franchise_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('whatsapp_quick_replies')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Resposta rápida atualizada',
        description: 'A resposta rápida foi atualizada com sucesso',
      });

      await fetchQuickReplies();
    } catch (error) {
      console.error('Erro ao atualizar resposta rápida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a resposta rápida',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteQuickReply = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_quick_replies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Resposta rápida excluída',
        description: 'A resposta rápida foi excluída com sucesso',
      });

      await fetchQuickReplies();
    } catch (error) {
      console.error('Erro ao excluir resposta rápida:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a resposta rápida',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchQuickReplies();
  }, [franchiseId]);

  return {
    quickReplies,
    loading,
    createQuickReply,
    updateQuickReply,
    deleteQuickReply,
    refetch: fetchQuickReplies,
  };
};
