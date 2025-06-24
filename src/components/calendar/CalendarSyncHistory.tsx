
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface CalendarSyncHistoryProps {
  isConnected: boolean;
  currentFranchise: string;
}

const CalendarSyncHistory: React.FC<CalendarSyncHistoryProps> = ({
  isConnected,
  currentFranchise,
}) => {
  return (
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
  );
};

export default CalendarSyncHistory;
