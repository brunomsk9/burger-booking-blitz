
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import ReservationManager from './ReservationManager';
import UserManager from './UserManager';
import UserRegistration from './UserRegistration';
import ReportsManager from './ReportsManager';
import GoogleCalendar from './GoogleCalendar';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  CalendarDays, 
  LogOut,
  UserPlus
} from 'lucide-react';

type MenuOption = 'dashboard' | 'reservas' | 'usuarios' | 'cadastro-usuario' | 'relatorios' | 'calendario';

const Layout: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { canManageUsers, canViewReports } = usePermissions();
  const [selectedMenu, setSelectedMenu] = useState<MenuOption>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-red-600 text-2xl font-bold mx-auto mb-4 animate-pulse">
            🦸
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <AuthPage />;
  }

  const menuItems = [
    { key: 'dashboard' as MenuOption, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { key: 'reservas' as MenuOption, label: 'Reservas', icon: Calendar, show: true },
    { key: 'usuarios' as MenuOption, label: 'Usuários', icon: Users, show: canManageUsers() },
    { key: 'cadastro-usuario' as MenuOption, label: 'Cadastrar Usuário', icon: UserPlus, show: canManageUsers() },
    { key: 'relatorios' as MenuOption, label: 'Relatórios', icon: BarChart3, show: canViewReports() },
    { key: 'calendario' as MenuOption, label: 'Calendário', icon: CalendarDays, show: true },
  ].filter(item => item.show);

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservas':
        return <ReservationManager />;
      case 'usuarios':
        return <UserManager />;
      case 'cadastro-usuario':
        return <UserRegistration />;
      case 'relatorios':
        return <ReportsManager />;
      case 'calendario':
        return <GoogleCalendar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-red-600 text-xl font-bold mr-3">
                🦸
              </div>
              <h1 className="text-xl font-bold text-gray-900">Herois Burguer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {userProfile.name} ({userProfile.role})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedMenu(item.key)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                        selectedMenu === item.key
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
