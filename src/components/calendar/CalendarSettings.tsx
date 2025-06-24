
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface CalendarSettingsProps {
  calendarId: string;
  onCalendarIdChange: (id: string) => void;
  isConnected: boolean;
  canConfigureCalendar: boolean;
}

const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  calendarId,
  onCalendarIdChange,
  isConnected,
  canConfigureCalendar,
}) => {
  return (
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
            onChange={(e) => onCalendarIdChange(e.target.value)}
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
  );
};

export default CalendarSettings;
