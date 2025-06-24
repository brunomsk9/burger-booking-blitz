
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  CalendarDays,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { signOut, userProfile, loading } = useAuth();
  const { canManageUsers, canViewReservations, getRoleText } = usePermissions();

  console.log('📋 Layout - Estado completo:', {
    userProfile,
    loading,
    canManageUsers: canManageUsers(),
    canViewReservations: canViewReservations()
  });

  // Se ainda está carregando, mostrar indicador
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg animate-pulse">
            🦸
          </div>
          <p className="text-lg text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: Calendar,
      show: canViewReservations()
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      show: canManageUsers()
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      show: canViewReservations()
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: CalendarDays,
      show: canViewReservations()
    }
  ];

  console.log('📋 Layout - Items de navegação:', navigationItems.map(item => ({
    label: item.label,
    show: item.show
  })));

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🦸
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Heróis Burger - Sistema de Reservas
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{userProfile.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {getRoleText(userProfile.role)}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigationItems
                .filter(item => {
                  console.log(`🔍 Item ${item.label} - show: ${item.show}`);
                  return item.show;
                })
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        currentPage === item.id 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => onPageChange(item.id)}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
