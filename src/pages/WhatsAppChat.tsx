import React, { useState, useEffect, useRef } from 'react';
import { useCurrentUserFranchises } from '@/hooks/useCurrentUserFranchises';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageCircle, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WhatsAppChat: React.FC = () => {
  const { franchises, loading: franchisesLoading } = useCurrentUserFranchises();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, chatGroups, loading, sendMessage } = useWhatsAppMessages(selectedFranchiseId);

  // Auto-select first franchise
  useEffect(() => {
    if (franchises.length > 0 && !selectedFranchiseId) {
      setSelectedFranchiseId(franchises[0].id);
    }
  }, [franchises, selectedFranchiseId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    const chat = chatGroups.find((c) => c.chat_id === selectedChatId);
    if (!chat) return;

    try {
      await sendMessage(selectedChatId, chat.customer_phone, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const filteredMessages = selectedChatId
    ? messages.filter((m) => m.chat_id === selectedChatId)
    : [];

  const selectedChat = chatGroups.find((c) => c.chat_id === selectedChatId);

  if (franchisesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (franchises.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma franquia encontrada</h3>
            <p className="text-muted-foreground">
              Você precisa estar associado a uma franquia para acessar o chat do WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            WhatsApp Chat
          </h1>
          <Select value={selectedFranchiseId || ''} onValueChange={setSelectedFranchiseId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione uma franquia" />
            </SelectTrigger>
            <SelectContent>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.id} value={franchise.id}>
                  {franchise.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Conversas</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : chatGroups.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa ainda</p>
              </div>
            ) : (
              chatGroups.map((chat) => (
                <div
                  key={chat.chat_id}
                  onClick={() => setSelectedChatId(chat.chat_id)}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    selectedChatId === chat.chat_id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm truncate">{chat.customer_name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(chat.last_message_time), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.last_message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/30">
          {selectedChatId && selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-card border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedChat.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChat.customer_phone}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === 'outgoing'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {format(new Date(message.timestamp), 'HH:mm', { locale: ptBR })}
                          </span>
                          {message.direction === 'outgoing' && (
                            <span className="text-xs opacity-70">
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                              {message.status === 'failed' && '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="bg-card border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChat;
