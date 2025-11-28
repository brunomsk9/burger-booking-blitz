import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppMetrics {
  activeChats: number;
  totalMessages: number;
  avgResponseTime: number; // em minutos
  satisfactionScore: number; // média de 0-5
  satisfactionCount: number;
  responseRate: number; // percentual de chats com resposta
  messagesPerDay: { date: string; count: number }[];
  satisfactionDistribution: { rating: string; count: number }[];
}

export const useWhatsAppMetrics = (franchiseId: string | null, dateRange: { from: Date; to: Date }) => {
  const [metrics, setMetrics] = useState<WhatsAppMetrics>({
    activeChats: 0,
    totalMessages: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    satisfactionCount: 0,
    responseRate: 0,
    messagesPerDay: [],
    satisfactionDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    if (!franchiseId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Conversas ativas (chats com mensagens nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activeChatsData, error: activeChatsError } = await supabase
        .from('whatsapp_chats')
        .select('id')
        .eq('franchise_id', franchiseId)
        .gte('last_message_time', sevenDaysAgo.toISOString())
        .eq('archived', false);

      if (activeChatsError) throw activeChatsError;

      // 2. Total de mensagens no período
      const { data: messagesData, error: messagesError } = await supabase
        .from('whatsapp_messages')
        .select('id, timestamp, direction, chat_id')
        .eq('franchise_id', franchiseId)
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString())
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      // 3. Calcular tempo médio de resposta
      let totalResponseTime = 0;
      let responseCount = 0;
      const chatMessages: Record<string, any[]> = {};

      // Agrupar mensagens por chat
      messagesData?.forEach((msg) => {
        if (!chatMessages[msg.chat_id]) {
          chatMessages[msg.chat_id] = [];
        }
        chatMessages[msg.chat_id].push(msg);
      });

      // Calcular tempo de resposta para cada chat
      Object.values(chatMessages).forEach((messages) => {
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].direction === 'incoming' && messages[i + 1].direction === 'outgoing') {
            const responseTime =
              new Date(messages[i + 1].timestamp).getTime() - new Date(messages[i].timestamp).getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      });

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount / 1000 / 60 : 0; // em minutos

      // 4. Taxa de resposta (chats que receberam pelo menos uma resposta)
      const chatsWithResponses = Object.values(chatMessages).filter((messages) =>
        messages.some((msg) => msg.direction === 'outgoing')
      ).length;
      const responseRate = Object.keys(chatMessages).length > 0 
        ? (chatsWithResponses / Object.keys(chatMessages).length) * 100 
        : 0;

      // 5. Mensagens por dia
      const messagesByDay: Record<string, number> = {};
      messagesData?.forEach((msg) => {
        const date = new Date(msg.timestamp).toISOString().split('T')[0];
        messagesByDay[date] = (messagesByDay[date] || 0) + 1;
      });

      const messagesPerDay = Object.entries(messagesByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 6. Satisfação dos clientes (da tabela reservations)
      const { data: satisfactionData, error: satisfactionError } = await supabase
        .from('reservations')
        .select('avaliacao')
        .eq('franchise_name', franchiseId)
        .not('avaliacao', 'is', null)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (satisfactionError) throw satisfactionError;

      // Calcular média e distribuição
      const satisfactionScores: number[] = [];
      const satisfactionDist: Record<string, number> = {};

      satisfactionData?.forEach((item) => {
        const score = parseFloat(item.avaliacao || '0');
        if (score > 0) {
          satisfactionScores.push(score);
          const rating = Math.round(score).toString();
          satisfactionDist[rating] = (satisfactionDist[rating] || 0) + 1;
        }
      });

      const avgSatisfaction =
        satisfactionScores.length > 0
          ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
          : 0;

      const satisfactionDistribution = Object.entries(satisfactionDist)
        .map(([rating, count]) => ({ rating: `${rating} ⭐`, count }))
        .sort((a, b) => b.rating.localeCompare(a.rating));

      setMetrics({
        activeChats: activeChatsData?.length || 0,
        totalMessages: messagesData?.length || 0,
        avgResponseTime: Math.round(avgResponseTime),
        satisfactionScore: Math.round(avgSatisfaction * 10) / 10,
        satisfactionCount: satisfactionScores.length,
        responseRate: Math.round(responseRate),
        messagesPerDay,
        satisfactionDistribution,
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as métricas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [franchiseId, dateRange.from, dateRange.to]);

  return {
    metrics,
    loading,
    refetch: fetchMetrics,
  };
};
