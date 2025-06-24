import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Link, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GoogleCalendar: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulação de conexão com Google Calendar
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({ 
        title: 'Conectado com sucesso!', 
        description: 'Sua conta do Google Calendar foi conectada.' 
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCalendarId('');
    toast({ 
      title: 'Desconectado', 
      description: 'Sua conta do Google Calendar foi desconectada.' 
    });
  };

  const handleSyncReservations = () => {
    toast({ 
      title: 'Sincronizando...', 
      description: 'As reservas estão sendo sincronizadas com o Google Calendar.' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Integração Google Calendar</h2>
        {isConnected && (
          <Button onClick={handleSyncReservations} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw size={16} className="mr-2" />
            Sincronizar Agora
          </Button>
        )}
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Status da Conexão
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
                    <p className="text-sm text-gray-600">Sua conta está sincronizada</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="text-orange-600" size={24} />
                  <div>
                    <p className="font-semibold text-orange-700">Não conectado</p>
                    <p className="text-sm text-gray-600">Configure sua conta para sincronizar reservas</p>
                  </div>
                </>
              )}
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Configurações
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
              disabled={!isConnected}
            />
            <p className="text-sm text-gray-500 mt-1">
              Deixe em branco para usar o calendário principal
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Como funciona:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Reservas confirmadas são automaticamente adicionadas ao calendário</li>
              <li>• Reservas canceladas são removidas do calendário</li>
              <li>• Alterações nas reservas são sincronizadas em tempo real</li>
              <li>• Cada reserva inclui detalhes como cliente, franquia e personagens</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Sincronizações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Sincronização completa</p>
                  <p className="text-sm text-gray-600">3 reservas sincronizadas</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Há 2 minutos
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Reserva adicionada</p>
                  <p className="text-sm text-gray-600">João Silva - Herois Burguer Shopping</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  Há 1 hora
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Reserva cancelada</p>
                  <p className="text-sm text-gray-600">Maria Santos - Herois Burguer Centro</p>
                </div>
                <Badge className="bg-gray-100 text-gray-700">
                  Há 3 horas
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Conecte sua conta para ver o histórico de sincronização</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendar;
