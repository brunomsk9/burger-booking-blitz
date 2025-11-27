import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppMessage {
  id: string;
  franchise_id: string;
  chat_id: string;
  customer_name: string | null;
  customer_phone: string;
  message_text: string;
  direction: 'incoming' | 'outgoing';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  message_id: string | null;
  created_at: string;
}

export interface ChatGroup {
  chat_id: string;
  customer_name: string;
  customer_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const useWhatsAppMessages = (franchiseId: string | null) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all messages for a franchise
  const fetchMessages = async () => {
    if (!franchiseId) {
      setMessages([]);
      setChatGroups([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as WhatsAppMessage[]);
      
      // Group messages by chat_id
      const groups = groupMessagesByChat((data || []) as WhatsAppMessage[]);
      setChatGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Group messages by chat for the sidebar
  const groupMessagesByChat = (msgs: WhatsAppMessage[]): ChatGroup[] => {
    const grouped = msgs.reduce((acc, msg) => {
      if (!acc[msg.chat_id]) {
        acc[msg.chat_id] = {
          chat_id: msg.chat_id,
          customer_name: msg.customer_name || msg.customer_phone,
          customer_phone: msg.customer_phone,
          last_message: msg.message_text,
          last_message_time: msg.timestamp,
          unread_count: 0,
        };
      } else {
        // Update with latest message
        if (new Date(msg.timestamp) > new Date(acc[msg.chat_id].last_message_time)) {
          acc[msg.chat_id].last_message = msg.message_text;
          acc[msg.chat_id].last_message_time = msg.timestamp;
        }
      }
      return acc;
    }, {} as Record<string, ChatGroup>);

    return Object.values(grouped).sort(
      (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );
  };

  // Send a message
  const sendMessage = async (chatId: string, customerPhone: string, messageText: string) => {
    if (!franchiseId) return;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send-message', {
        body: {
          franchiseId,
          chatId,
          customerPhone,
          messageText,
        },
      });

      if (error) throw error;

      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso',
      });

      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!franchiseId) return;

    fetchMessages();

    const channel = supabase
      .channel('whatsapp-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `franchise_id=eq.${franchiseId}`,
        },
        (payload) => {
          console.log('📨 Nova mensagem recebida:', payload);
          const newMessage = payload.new as WhatsAppMessage;
          
          setMessages((prev) => [...prev, newMessage]);
          
          // Update chat groups
          setChatGroups((prev) => {
            const updated = [...prev];
            const existingIndex = updated.findIndex((g) => g.chat_id === newMessage.chat_id);
            
            if (existingIndex >= 0) {
              updated[existingIndex] = {
                ...updated[existingIndex],
                last_message: newMessage.message_text,
                last_message_time: newMessage.timestamp,
              };
            } else {
              updated.unshift({
                chat_id: newMessage.chat_id,
                customer_name: newMessage.customer_name || newMessage.customer_phone,
                customer_phone: newMessage.customer_phone,
                last_message: newMessage.message_text,
                last_message_time: newMessage.timestamp,
                unread_count: 0,
              });
            }
            
            return updated.sort(
              (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
            );
          });

          if (newMessage.direction === 'incoming') {
            toast({
              title: '📱 Nova mensagem',
              description: `${newMessage.customer_name || newMessage.customer_phone}: ${newMessage.message_text.substring(0, 50)}...`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [franchiseId]);

  return {
    messages,
    chatGroups,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};
