
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
import FranchiseManager from './FranchiseManager';
import FranchiseRegistration from './FranchiseRegistration';
import ReportsManager from './ReportsManager';
import GoogleCalendar from './GoogleCalendar';
import ProfileEditor from './ProfileEditor';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  CalendarDays, 
  LogOut,
  UserPlus,
  Building2,
  Plus,
  Settings,
  User
} from 'lucide-react';

type MenuOption = 'dashboard' | 'reservas' | 'usuarios' | 'cadastro-usuario' | 'franquias' | 'cadastro-franquia' | 'relatorios' | 'calendario' | 'perfil';

const Layout: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { canManageUsers, canViewReports, canCreateUsers, isSuperAdmin } = usePermissions();
  const [selectedMenu, setSelectedMenu] = useState<MenuOption>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-medium mx-auto mb-4 animate-pulse">
            H
          </div>
          <p className="text-muted-foreground">Carregando...</p>
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
    { key: 'cadastro-usuario' as MenuOption, label: 'Cadastrar Usuário', icon: UserPlus, show: canCreateUsers() },
    { key: 'franquias' as MenuOption, label: 'Franquias', icon: Building2, show: isSuperAdmin() },
    { key: 'cadastro-franquia' as MenuOption, label: 'Cadastrar Franquia', icon: Plus, show: isSuperAdmin() },
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
      case 'franquias':
        return <FranchiseManager />;
      case 'cadastro-franquia':
        return <FranchiseRegistration />;
      case 'relatorios':
        return <ReportsManager />;
      case 'calendario':
        return <GoogleCalendar />;
      case 'perfil':
        return <ProfileEditor onCancel={() => setSelectedMenu('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold mr-3">
                H
              </div>
              <h1 className="text-lg font-semibold text-foreground">Herois Burguer</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                {userProfile.name} ({userProfile.role})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMenu('perfil')}
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Perfil
              </Button>
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
            <Card className="bg-card">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedMenu(item.key)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors rounded-none ${
                        selectedMenu === item.key
                          ? 'bg-accent text-accent-foreground border-r-2 border-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
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
