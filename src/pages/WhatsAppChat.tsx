import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUserFranchises } from '@/hooks/useCurrentUserFranchises';
import { useWhatsAppMessages, PREDEFINED_TAGS } from '@/hooks/useWhatsAppMessages';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageCircle, Building2, ArrowLeft, LogOut, Home, Archive, Clock, Mail, Search, BarChart3, CheckCheck, Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppSidebar } from '@/components/AppSidebar';
import { QuickReplyManager } from '@/components/whatsapp/QuickReplyManager';
import { QuickReplySelector } from '@/components/whatsapp/QuickReplySelector';
import { MetricsDashboard } from '@/components/whatsapp/MetricsDashboard';
import { supabase } from '@/integrations/supabase/client';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WhatsAppChat: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { franchises, loading: franchisesLoading } = useCurrentUserFranchises();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showMetrics, setShowMetrics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    messages, 
    messagesLoading,
    chatGroups, 
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
    updateChatTags
  } = useWhatsAppMessages(selectedFranchiseId, selectedChatId);

  const { quickReplies } = useQuickReplies(selectedFranchiseId);

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

  // Handle typing detection
  const handleInputChange = (value: string) => {
    setMessageInput(value);

    if (!selectedChatId || !selectedFranchiseId || !selectedChat) return;

    // Check for quick reply shortcuts
    const shortcutMatch = quickReplies.find(
      (reply) => reply.shortcut && value === reply.shortcut
    );

    if (shortcutMatch) {
      setMessageInput(shortcutMatch.message);
      return;
    }
  };

  const handleQuickReplySelect = (message: string) => {
    setMessageInput(message);
  };

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

  const handleChatClick = async (chatId: string) => {
    setSelectedChatId(chatId);
    await markChatAsRead(chatId);
  };

  // Messages are now fetched directly for the selected chat
  const selectedChat = chatGroups.find((c) => c.chat_id === selectedChatId);

  if (franchisesLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar selectedMenu="whatsapp" onMenuSelect={(menu) => {
            if (menu !== 'whatsapp') navigate('/');
          }} />
          <SidebarInset>
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (franchises.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar selectedMenu="whatsapp" onMenuSelect={(menu) => {
            if (menu !== 'whatsapp') navigate('/');
          }} />
          <SidebarInset>
            <div className="flex justify-center items-center h-screen">
              <Card className="max-w-md">
                <CardContent className="pt-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma franquia encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Você precisa estar associado a uma franquia para acessar o chat do WhatsApp.
                  </p>
                  <Button onClick={() => navigate('/')} variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao Início
                  </Button>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar selectedMenu="whatsapp" onMenuSelect={(menu) => {
          if (menu !== 'whatsapp') navigate('/');
        }} />
        <SidebarInset className="flex flex-col h-full">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
              <div className="flex items-center justify-between flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Chat
              </h1>
              <div className="flex items-center gap-3">
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
                {selectedFranchiseId && (
                  <>
                    <Button
                      variant={showMetrics ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setShowMetrics(!showMetrics)}
                      title={showMetrics ? 'Ver conversas' : 'Ver métricas'}
                    >
                      {showMetrics ? <MessageCircle className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                    </Button>
                    {!showMetrics && <QuickReplyManager franchiseId={selectedFranchiseId} />}
                  </>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{userProfile?.name}</span>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {showMetrics && selectedFranchiseId ? (
              /* Dashboard de Métricas */
              <div className="flex-1 overflow-auto">
                <MetricsDashboard franchiseId={selectedFranchiseId} />
              </div>
            ) : (
              <>
                {/* Sidebar - Chat List */}
                <div className="w-80 border-r bg-card flex flex-col h-full">
              <div className="p-4 border-b space-y-3 bg-[hsl(var(--whatsapp-green-dark))]">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-white">Conversas</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllChatsAsRead}
                    className="text-white hover:bg-white/10"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar conversa..."
                    className="pl-9 bg-white/90"
                  />
                </div>
                
                {/* Filters */}
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <TabsList className="grid w-full grid-cols-4 bg-white/10">
                    <TabsTrigger value="all" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      Todas
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      <Mail className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="awaiting_response" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      <Clock className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      <Archive className="h-3 w-3" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Tags Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-white/90 justify-start">
                      <Tag className="h-4 w-4 mr-2" />
                      {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'Filtrar por tag'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Filtrar por Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {PREDEFINED_TAGS.map((tag) => (
                          <Badge
                            key={tag.value}
                            variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              if (selectedTags.includes(tag.value)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag.value));
                              } else {
                                setSelectedTags([...selectedTags, tag.value]);
                              }
                            }}
                          >
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTags([])}
                          className="w-full"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : chatGroups.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}</p>
                  </div>
                ) : (
                  chatGroups.map((chat) => (
                    <div
                      key={chat.chat_id}
                      onClick={() => handleChatClick(chat.chat_id)}
                      className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                        selectedChatId === chat.chat_id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          {chat.unread_count > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className={`text-sm truncate ${chat.unread_count > 0 ? 'font-bold' : 'font-semibold'}`}>
                                {chat.customer_name}
                              </h3>
                              {chat.needs_response && !chat.archived && (
                                <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                              )}
                              {chat.archived && (
                                <Archive className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {format(new Date(chat.last_message_time), 'HH:mm')}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {chat.last_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-muted/30 h-full">
              {selectedChatId && selectedChat ? (
                  <>
                  {/* Chat Header */}
                  <div className="bg-[hsl(var(--whatsapp-green-dark))] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{selectedChat.customer_name}</h3>
                          <p className="text-sm text-white/80">{selectedChat.customer_phone}</p>
                          {selectedChat.tags && selectedChat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedChat.tags.map((tagValue) => {
                                const tag = PREDEFINED_TAGS.find(t => t.value === tagValue);
                                return tag ? (
                                  <Badge key={tagValue} className={`${tag.color} text-white text-xs`}>
                                    {tag.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/10"
                            >
                              <Tag className="h-4 w-4 mr-2" />
                              Tags
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4 className="font-medium">Gerenciar Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {PREDEFINED_TAGS.map((tag) => {
                                  const isSelected = selectedChat.tags?.includes(tag.value);
                                  return (
                                    <Badge
                                      key={tag.value}
                                      variant={isSelected ? 'default' : 'outline'}
                                      className={`cursor-pointer ${isSelected ? `${tag.color} text-white` : ''}`}
                                      onClick={() => {
                                        const currentTags = selectedChat.tags || [];
                                        const newTags = isSelected
                                          ? currentTags.filter(t => t !== tag.value)
                                          : [...currentTags, tag.value];
                                        updateChatTags(selectedChatId, newTags);
                                      }}
                                    >
                                      {tag.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                              {selectedChat.tags && selectedChat.tags.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateChatTags(selectedChatId, [])}
                                  className="w-full"
                                >
                                  Remover todas as tags
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleArchiveChat(selectedChatId)}
                          className="text-white hover:bg-white/10"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          {selectedChat.archived ? 'Desarquivar' : 'Arquivar'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4 bg-[hsl(var(--whatsapp-bg))]">
                    <div className="space-y-2">
                      {messagesLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                              message.direction === 'outgoing'
                                ? 'bg-[hsl(var(--whatsapp-bubble))] text-foreground rounded-br-none'
                                : 'bg-white dark:bg-card rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
                            <div className="flex items-center gap-2 mt-1 justify-end">
                              <span className="text-xs opacity-60">
                                {format(new Date(message.timestamp), 'HH:mm', { locale: ptBR })}
                              </span>
                              {message.direction === 'outgoing' && (
                                <span className="text-xs opacity-60">
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
                  </div>

                  {/* Input */}
                  <div className="bg-card p-4">
                    <div className="flex gap-2">
                      <QuickReplySelector 
                        quickReplies={quickReplies}
                        onSelect={handleQuickReplySelect}
                      />
                      <Input
                        value={messageInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Digite sua mensagem ou use / para atalhos..."
                        className="flex-1 rounded-full"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!messageInput.trim()}
                        className="rounded-full w-12 h-12 p-0"
                      >
                        <Send className="h-5 w-5" />
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
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default WhatsAppChat;
