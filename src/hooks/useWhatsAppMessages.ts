import { useEffect, useState, useCallback } from 'react';
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
  tags: string[];
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
  tags: string[];
  needs_response: boolean;
}

export type ChatFilter = 'all' | 'unread' | 'awaiting_response' | 'archived';

export const PREDEFINED_TAGS = [
  { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
  { value: 'resolvido', label: 'Resolvido', color: 'bg-green-500' },
  { value: 'aguardando_cliente', label: 'Aguardando Cliente', color: 'bg-yellow-500' },
  { value: 'aguardando_interno', label: 'Aguardando Interno', color: 'bg-blue-500' },
  { value: 'importante', label: 'Importante', color: 'bg-orange-500' },
  { value: 'follow_up', label: 'Follow-up', color: 'bg-purple-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-gray-500' },
  { value: 'vip', label: 'VIP', color: 'bg-pink-500' },
] as const;

export const useWhatsAppMessages = (franchiseId: string | null) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Optimized: Fetch chats and last messages in parallel
  const fetchChatsOptimized = useCallback(async () => {
    if (!franchiseId) {
      console.log('⚠️ useWhatsAppMessages - Nenhuma franquia selecionada');
      setChats([]);
      setChatGroups([]);
      setLoading(false);
      return;
    }

    console.log('🔍 useWhatsAppMessages - Buscando chats para franquia:', franchiseId);

    try {
      // Fetch chats and last messages in parallel
      const [chatsResult, lastMessagesResult] = await Promise.all([
        supabase
          .from('whatsapp_chats')
          .select('*')
          .eq('franchise_id', franchiseId)
          .order('last_message_time', { ascending: false }),
        // Get last message for each chat using a single query
        supabase
          .from('whatsapp_messages')
          .select('chat_id, message_text, timestamp, direction')
          .eq('franchise_id', franchiseId)
          .order('timestamp', { ascending: false })
      ]);

      if (chatsResult.error) {
        console.error('❌ Erro ao buscar chats:', chatsResult.error);
        throw chatsResult.error;
      }

      const chatsData = (chatsResult.data || []) as WhatsAppChat[];
      console.log('✅ Chats encontrados:', chatsData.length);
      setChats(chatsData);

      // Create a map of last messages by chat_id
      const lastMessageMap = new Map<string, { message_text: string; timestamp: string; direction: string }>();
      const lastIncomingMap = new Map<string, string>(); // chat_id -> timestamp of last incoming

      if (lastMessagesResult.data) {
        for (const msg of lastMessagesResult.data) {
          // Store first occurrence (which is the latest due to ordering)
          if (!lastMessageMap.has(msg.chat_id)) {
            lastMessageMap.set(msg.chat_id, {
              message_text: msg.message_text,
              timestamp: msg.timestamp,
              direction: msg.direction
            });
          }
          // Track last incoming message
          if (msg.direction === 'incoming' && !lastIncomingMap.has(msg.chat_id)) {
            lastIncomingMap.set(msg.chat_id, msg.timestamp);
          }
        }
      }

      // Build chat groups efficiently
      const groups: ChatGroup[] = chatsData.map(chat => {
        const lastMessage = lastMessageMap.get(chat.chat_id);
        const lastIncomingTime = lastIncomingMap.get(chat.chat_id);
        
        const needsResponse = lastIncomingTime && (!chat.last_agent_message_time || 
          new Date(lastIncomingTime) > new Date(chat.last_agent_message_time));

        return {
          chat_id: chat.chat_id,
          customer_name: chat.customer_name || chat.customer_phone,
          customer_phone: chat.customer_phone,
          last_message: lastMessage?.message_text || '',
          last_message_time: lastMessage?.timestamp || chat.last_message_time || new Date().toISOString(),
          unread_count: chat.unread_count,
          archived: chat.archived,
          tags: chat.tags || [],
          needs_response: !!needsResponse,
        };
      });

      setChatGroups(groups);
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
  }, [franchiseId, toast]);

  // Fetch messages for selected chat only (lazy loading)
  const fetchMessages = useCallback(async () => {
    if (!franchiseId) {
      setMessages([]);
      return;
    }

    console.log('🔍 useWhatsAppMessages - Buscando mensagens para franquia:', franchiseId);

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
  }, [franchiseId]);

  // Send a message
  const sendMessage = async (chatId: string, customerPhone: string, messageText: string) => {
    if (!franchiseId) {
      console.error('❌ franchiseId não está definido');
      return;
    }

    console.log('📤 Enviando mensagem:', { franchiseId, chatId, customerPhone });

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send-message', {
        body: {
          franchiseId,
          chatId,
          customerPhone,
          messageText,
        },
      });

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        throw error;
      }

      console.log('✅ Mensagem enviada:', data);

      await fetchMessages();
      await fetchChatsOptimized();

      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
    }
  };

  // Toggle archive status
  const toggleArchiveChat = async (chatId: string) => {
    if (!franchiseId) return;

    const chat = chats.find((c) => c.chat_id === chatId);
    if (!chat) return;

    try {
      const { error } = await supabase
        .from('whatsapp_chats')
        .update({ archived: !chat.archived })
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chatId);

      if (error) throw error;

      await fetchChatsOptimized();

      toast({
        title: chat.archived ? 'Chat desarquivado' : 'Chat arquivado',
        description: `O chat foi ${chat.archived ? 'desarquivado' : 'arquivado'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao arquivar chat:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do chat',
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

      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.chat_id === chatId ? { ...chat, unread_count: 0 } : chat
        )
      );

      setChatGroups(prevGroups =>
        prevGroups.map(group =>
          group.chat_id === chatId ? { ...group, unread_count: 0 } : group
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  // Mark all chats as read
  const markAllChatsAsRead = async () => {
    if (!franchiseId) return;

    try {
      const { error } = await supabase
        .from('whatsapp_chats')
        .update({ unread_count: 0 })
        .eq('franchise_id', franchiseId);

      if (error) throw error;

      await fetchChatsOptimized();

      toast({
        title: 'Todas as conversas marcadas como lidas',
        description: 'Todos os chats foram marcados como lidos',
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as conversas como lidas',
        variant: 'destructive',
      });
    }
  };

  // Clear all conversations
  const clearAllConversations = async () => {
    if (!franchiseId) return;

    try {
      const { error: messagesError } = await supabase
        .from('whatsapp_messages')
        .delete()
        .eq('franchise_id', franchiseId);

      if (messagesError) throw messagesError;

      const { error: chatsError } = await supabase
        .from('whatsapp_chats')
        .delete()
        .eq('franchise_id', franchiseId);

      if (chatsError) throw chatsError;

      toast({
        title: 'Conversas limpas',
        description: 'Todas as conversas foram removidas com sucesso',
      });

      setMessages([]);
      setChats([]);
      setChatGroups([]);
    } catch (error) {
      console.error('Erro ao limpar conversas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar as conversas',
        variant: 'destructive',
      });
    }
  };

  // Update chat tags
  const updateChatTags = async (chatId: string, tags: string[]) => {
    if (!franchiseId) return;

    try {
      const { error } = await supabase
        .from('whatsapp_chats')
        .update({ tags })
        .eq('franchise_id', franchiseId)
        .eq('chat_id', chatId);

      if (error) throw error;

      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.chat_id === chatId ? { ...chat, tags } : chat
        )
      );

      setChatGroups(prevGroups =>
        prevGroups.map(group =>
          group.chat_id === chatId ? { ...group, tags } : group
        )
      );

      toast({
        title: 'Tags atualizadas',
        description: 'As tags foram atualizadas com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar tags:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as tags',
        variant: 'destructive',
      });
    }
  };

  // Filter chat groups based on selected filter, search query, and tags
  const filteredChatGroups = chatGroups.filter((chat) => {
    // Apply status filter
    let statusMatch = false;
    switch (filter) {
      case 'unread':
        statusMatch = chat.unread_count > 0;
        break;
      case 'awaiting_response':
        statusMatch = chat.needs_response && !chat.archived;
        break;
      case 'archived':
        statusMatch = chat.archived;
        break;
      case 'all':
      default:
        statusMatch = !chat.archived;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = chat.customer_name.toLowerCase().includes(query);
      const phoneMatch = chat.customer_phone.includes(query);
      return statusMatch && (nameMatch || phoneMatch);
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some(tag => chat.tags.includes(tag));
      return statusMatch && hasMatchingTag;
    }

    return statusMatch;
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!franchiseId) return;

    fetchChatsOptimized();
    fetchMessages();

    const messagesChannel = supabase
      .channel('whatsapp-messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `franchise_id=eq.${franchiseId}`,
        },
        (payload) => {
          console.log('💬 Mensagem atualizada:', payload);
          fetchMessages();

          // If it's a new incoming message, show toast
          const newMessage = payload.new as WhatsAppMessage;
          if (payload.eventType === 'INSERT' && newMessage.direction === 'incoming') {
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
          fetchChatsOptimized();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [franchiseId, fetchChatsOptimized, fetchMessages, toast]);

  return {
    messages,
    chatGroups: filteredChatGroups,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    sendMessage,
    toggleArchiveChat,
    markChatAsRead,
    markAllChatsAsRead,
    clearAllConversations,
    updateChatTags,
    refetch: () => {
      fetchChatsOptimized();
      fetchMessages();
    },
  };
};
