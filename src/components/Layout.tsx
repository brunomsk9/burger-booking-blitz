
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchises } from '@/hooks/useFranchises';
import { Button } from '@/components/ui/button';
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
import { AppSidebar } from './AppSidebar';
import { 
  LogOut,
  Settings,
} from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type MenuOption = 'dashboard' | 'reservas' | 'usuarios' | 'cadastro-usuario' | 'franquias' | 'cadastro-franquia' | 'relatorios' | 'calendario' | 'perfil';

const Layout: React.FC = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const { franchises } = useFranchises();
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

  // Buscar o nome da franquia do usuário
  const getUserFranchiseName = () => {
    if (userProfile.role === 'superadmin') {
      return 'Herois Burguer';
    }
    
    // Como não temos franchise_id no UserProfile, por enquanto retornamos o nome padrão
    // TODO: Implementar relacionamento entre usuário e franquia quando necessário
    if (franchises.length > 0) {
      // Por enquanto, pega a primeira franquia disponível para usuários não-superadmin
      const firstFranchise = franchises[0];
      return firstFranchise.displayName || firstFranchise.company_name || firstFranchise.name;
    }
    
    return 'Herois Burguer';
  };

  const franchiseName = getUserFranchiseName();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-semibold mr-3">
                  H
                </div>
                <h1 className="text-lg font-semibold text-foreground">{franchiseName}</h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {userProfile.name} ({userProfile.role})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMenu('perfil')}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Perfil</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
