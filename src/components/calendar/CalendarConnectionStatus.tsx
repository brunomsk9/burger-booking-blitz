
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface CalendarConnectionStatusProps {
  isConnected: boolean;
  currentFranchise: string;
  canConfigureCalendar: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const CalendarConnectionStatus: React.FC<CalendarConnectionStatusProps> = ({
  isConnected,
  currentFranchise,
  canConfigureCalendar,
  isLoading,
  onConnect,
  onDisconnect,
}) => {
  return (
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
                <Button onClick={onDisconnect} variant="outline">
                  Desconectar
                </Button>
              ) : (
                <Button 
                  onClick={onConnect} 
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
  );
};

export default CalendarConnectionStatus;
