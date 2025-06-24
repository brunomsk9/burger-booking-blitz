import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Link, CheckCircle, AlertCircle, RefreshCw, Building2, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useFranchises } from '@/hooks/useFranchises';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GoogleCalendar: React.FC = () => {
  const { userProfile } = useAuth();
  const { isSuperAdmin, isAdmin, canManageFranchises } = usePermissions();
  const { franchises } = useFranchises();
  
  const [isConnected, setIsConnected] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState('');

  // Determinar a franquia atual do usuário
  const getCurrentFranchise = () => {
    if (isSuperAdmin()) {
      // Superadmin pode escolher qualquer franquia
      return selectedFranchise || (franchises.length > 0 ? franchises[0].displayName : '');
    } else {
      // Para outros usuários, usar a primeira franquia disponível (pode ser melhorado com relacionamento user-franchise)
      return franchises.length > 0 ? franchises[0].displayName : 'Herois Burguer';
    }
  };

  const currentFranchise = getCurrentFranchise();

  useEffect(() => {
    // Simular carregamento do status da franquia selecionada
    if (currentFranchise) {
      // Aqui normalmente carregaríamos as configurações específicas da franquia
      setIsConnected(false); // Por enquanto, sempre inicia desconectado
      setCalendarId('');
    }
  }, [currentFranchise]);

  const handleConnect = async () => {
    if (!currentFranchise) {
      toast({
        title: 'Erro',
        description: 'Nenhuma franquia selecionada.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de conexão com Google Calendar para a franquia
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({ 
        title: 'Conectado com sucesso!', 
        description: `Google Calendar conectado para ${currentFranchise}.` 
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCalendarId('');
    toast({ 
      title: 'Desconectado', 
      description: `Google Calendar desconectado de ${currentFranchise}.` 
    });
  };

  const handleSyncReservations = () => {
    toast({ 
      title: 'Sincronizando...', 
      description: `Sincronizando reservas de ${currentFranchise} com o Google Calendar.` 
    });
  };

  const canConfigureCalendar = canManageFranchises() || isAdmin();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integração Google Calendar</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerenciar agenda da franquia: <span className="font-semibold">{currentFranchise}</span>
          </p>
        </div>
        {isConnected && canConfigureCalendar && (
          <Button onClick={handleSyncReservations} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw size={16} className="mr-2" />
            Sincronizar Agora
          </Button>
        )}
      </div>

      {/* Passo a Passo para Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle size={20} />
            Como configurar o Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="step-by-step">
              <AccordionTrigger>
                📋 Passo a passo completo para configuração
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-900">🔧 O que você precisa configurar:</h4>
                  <div className="space-y-4">
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-gray-900">1. Criar projeto no Google Cloud Console</h5>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• Acesse <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                        <li>• Crie um novo projeto ou selecione um existente</li>
                        <li>• Ative a API do Google Calendar</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-gray-900">2. Configurar OAuth 2.0</h5>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• Vá em "APIs e Serviços" → "Credenciais"</li>
                        <li>• Clique em "Criar credenciais" → "ID do cliente OAuth 2.0"</li>
                        <li>• Tipo: Aplicação web</li>
                        <li>• Adicione suas URLs autorizadas</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-medium text-gray-900">3. Configurar tela de consentimento</h5>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• Configure a tela que o usuário verá ao autorizar</li>
                        <li>• Adicione domínios autorizados</li>
                        <li>• Configure escopos necessários (Calendar API)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-gray-900">4. Obter credenciais</h5>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• <strong>Client ID:</strong> Necessário para autenticação</li>
                        <li>• <strong>Client Secret:</strong> Chave secreta da aplicação</li>
                        <li>• <strong>ID do Calendário:</strong> Opcional (usa 'primary' se não especificado)</li>
                      </ul>
                    </div>

                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-yellow-800">⚠️ Importante:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Apenas o ID do calendário NÃO É SUFICIENTE</li>
                    <li>• É necessário configurar OAuth 2.0 para autenticação</li>
                    <li>• Sem as credenciais corretas, a integração não funcionará</li>
                    <li>• Cada franquia pode ter seu próprio calendário</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-800">✅ Depois de configurado:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Reservas serão automaticamente adicionadas ao calendário</li>
                    <li>• Cancelamentos removerão os eventos</li>
                    <li>• Sincronização em tempo real</li>
                    <li>• Histórico de todas as operações</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="calendar-id-help">
              <AccordionTrigger>
                📅 Como encontrar o ID do Calendário?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Para usar o calendário principal:</h5>
                    <p className="text-sm text-gray-600">Deixe o campo em branco ou use <code className="bg-gray-200 px-2 py-1 rounded">primary</code></p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Para um calendário específico:</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Abra o Google Calendar na web</li>
                      <li>2. Na barra lateral esquerda, encontre o calendário desejado</li>
                      <li>3. Clique nos três pontos ao lado do nome</li>
                      <li>4. Selecione "Configurações e compartilhamento"</li>
                      <li>5. Role até "ID do calendário" e copie o valor</li>
                    </ol>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Seleção de Franquia (apenas para superadmin) */}
      {isSuperAdmin() && franchises.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Selecionar Franquia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="franchise-select">Franquia</Label>
              <select
                id="franchise-select"
                value={selectedFranchise}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {franchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.displayName}>
                    {franchise.displayName}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Status da Conexão - {currentFranchise}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-700">Conectado</p>
                    <p className="text-sm text-gray-600">Agenda da franquia sincronizada</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="text-orange-600" size={24} />
                  <div>
                    <p className="font-semibold text-orange-700">Não conectado</p>
                    <p className="text-sm text-gray-600">Configure a agenda para sincronizar reservas da franquia</p>
                  </div>
                </>
              )}
            </div>
            
            {canConfigureCalendar && (
              <div className="flex gap-2">
                {isConnected ? (
                  <Button onClick={handleDisconnect} variant="outline">
                    Desconectar
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnect} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Conectando...' : 'Conectar Google'}
                  </Button>
                )}
              </div>
            )}
            
            {!canConfigureCalendar && (
              <Badge variant="outline">
                Apenas visualização
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Configurações da Franquia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="calendarId">ID do Calendário (opcional)</Label>
            <Input
              id="calendarId"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="primary ou ID específico do calendário"
              disabled={!isConnected || !canConfigureCalendar}
            />
            <p className="text-sm text-gray-500 mt-1">
              Deixe em branco para usar o calendário principal da franquia
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Como funciona por franquia:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Cada franquia tem sua própria agenda no Google Calendar</li>
              <li>• Reservas da franquia são automaticamente adicionadas à agenda</li>
              <li>• Reservas canceladas são removidas da agenda</li>
              <li>• Alterações nas reservas são sincronizadas em tempo real</li>
              <li>• Eventos incluem detalhes como cliente, franquia e personagens</li>
            </ul>
          </div>

          {!canConfigureCalendar && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                🔒 <strong>Permissão limitada:</strong> Você pode visualizar as configurações, mas não pode modificá-las. Entre em contato com um administrador para alterações.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Sincronizações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização - {currentFranchise}</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Sincronização completa</p>
                  <p className="text-sm text-gray-600">5 reservas sincronizadas para {currentFranchise}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Há 2 minutos
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Reserva adicionada</p>
                  <p className="text-sm text-gray-600">João Silva - {currentFranchise}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  Há 1 hora
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Reserva cancelada</p>
                  <p className="text-sm text-gray-600">Maria Santos - {currentFranchise}</p>
                </div>
                <Badge className="bg-gray-100 text-gray-700">
                  Há 3 horas
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Conecte a agenda para ver o histórico de sincronização de {currentFranchise}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendar;
