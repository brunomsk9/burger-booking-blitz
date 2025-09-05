
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useFranchises } from '@/hooks/useFranchises';
import CalendarSetupInstructions from './calendar/CalendarSetupInstructions';
import FranchiseSelector from './calendar/FranchiseSelector';
import CalendarConnectionStatus from './calendar/CalendarConnectionStatus';
import CalendarSettings from './calendar/CalendarSettings';
import CalendarSyncHistory from './calendar/CalendarSyncHistory';

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
      return franchises.length > 0 ? franchises[0].displayName : 'reservaja';
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

      <CalendarSetupInstructions />

      {/* Seleção de Franquia (apenas para superadmin) */}
      {isSuperAdmin() && franchises.length > 1 && (
        <FranchiseSelector
          franchises={franchises}
          selectedFranchise={selectedFranchise}
          onFranchiseChange={setSelectedFranchise}
        />
      )}

      <CalendarConnectionStatus
        isConnected={isConnected}
        currentFranchise={currentFranchise}
        canConfigureCalendar={canConfigureCalendar}
        isLoading={isLoading}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <CalendarSettings
        calendarId={calendarId}
        onCalendarIdChange={setCalendarId}
        isConnected={isConnected}
        canConfigureCalendar={canConfigureCalendar}
      />

      <CalendarSyncHistory
        isConnected={isConnected}
        currentFranchise={currentFranchise}
      />
    </div>
  );
};

export default GoogleCalendar;
