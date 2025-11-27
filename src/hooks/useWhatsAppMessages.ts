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

export interface WhatsAppChat {
  id: string;
  franchise_id: string;
  chat_id: string;
  customer_name: string | null;
  customer_phone: string;
  archived: boolean;
  last_message_time: string | null;
  last_agent_message_time: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatGroup {
  chat_id: string;
  customer_name: string;
  customer_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  archived: boolean;
  needs_response: boolean;
}

export type ChatFilter = 'all' | 'unread' | 'awaiting_response' | 'archived';

export const useWhatsAppMessages = (franchiseId: string | null) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const { toast } = useToast();

  // Fetch chats metadata
  const fetchChats = async () => {
    if (!franchiseId) {
      setChats([]);
      setChatGroups([]);
      setLoading(false);
      return;
    }

    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('last_message_time', { ascending: false });

      if (chatsError) throw chatsError;

      setChats((chatsData || []) as WhatsAppChat[]);
      await buildChatGroups(chatsData || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as conversas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all messages for a franchise
  const fetchMessages = async () => {
    if (!franchiseId) {
      setMessages([]);
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
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Build chat groups with last message from messages table
  const buildChatGroups = async (chatsData: WhatsAppChat[]) => {
    const groups: ChatGroup[] = [];

    for (const chat of chatsData) {
      // Get last message for this chat
      const { data: lastMessage } = await supabase
        .from('whatsapp_messages')
        .select('message_text, timestamp')
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chat.chat_id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Determine if awaiting response (last message was incoming)
      const { data: lastIncoming } = await supabase
        .from('whatsapp_messages')
        .select('timestamp')
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chat.chat_id)
        .eq('direction', 'incoming')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      const needsResponse = lastIncoming && (!chat.last_agent_message_time || 
        new Date(lastIncoming.timestamp) > new Date(chat.last_agent_message_time));

      groups.push({
        chat_id: chat.chat_id,
        customer_name: chat.customer_name || chat.customer_phone,
        customer_phone: chat.customer_phone,
        last_message: lastMessage?.message_text || '',
        last_message_time: lastMessage?.timestamp || chat.last_message_time || new Date().toISOString(),
        unread_count: chat.unread_count,
        archived: chat.archived,
        needs_response: !!needsResponse,
      });
    }

    setChatGroups(groups);
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

  // Archive/unarchive chat
  const toggleArchiveChat = async (chatId: string) => {
    if (!franchiseId) return;

    try {
      const chat = chats.find((c) => c.chat_id === chatId);
      if (!chat) return;

      const { error } = await supabase
        .from('whatsapp_chats')
        .update({ archived: !chat.archived })
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chatId);

      if (error) throw error;

      toast({
        title: chat.archived ? 'Conversa desarquivada' : 'Conversa arquivada',
        description: `A conversa foi ${chat.archived ? 'desarquivada' : 'arquivada'} com sucesso`,
      });

      await fetchChats();
    } catch (error) {
      console.error('Erro ao arquivar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível arquivar a conversa',
        variant: 'destructive',
      });
    }
  };

  // Mark chat as read
  const markChatAsRead = async (chatId: string) => {
    if (!franchiseId) return;

    try {
      const { error } = await supabase
        .from('whatsapp_chats')
        .update({ unread_count: 0 })
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chatId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
    }
  };

  // Filter chat groups based on selected filter
  const filteredChatGroups = chatGroups.filter((chat) => {
    switch (filter) {
      case 'unread':
        return chat.unread_count > 0;
      case 'awaiting_response':
        return chat.needs_response && !chat.archived;
      case 'archived':
        return chat.archived;
      case 'all':
      default:
        return !chat.archived;
    }
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!franchiseId) return;

    fetchChats();
    fetchMessages();

    const messagesChannel = supabase
      .channel('whatsapp-messages-updates')
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

          if (newMessage.direction === 'incoming') {
            toast({
              title: '📱 Nova mensagem',
              description: `${newMessage.customer_name || newMessage.customer_phone}: ${newMessage.message_text.substring(0, 50)}...`,
            });
          }
        }
      )
      .subscribe();

    const chatsChannel = supabase
      .channel('whatsapp-chats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_chats',
          filter: `franchise_id=eq.${franchiseId}`,
        },
        () => {
          console.log('💬 Metadata do chat atualizada');
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [franchiseId]);

  return {
    messages,
    chatGroups: filteredChatGroups,
    loading,
    filter,
    setFilter,
    sendMessage,
    toggleArchiveChat,
    markChatAsRead,
    refetch: () => {
      fetchChats();
      fetchMessages();
    },
  };
};
