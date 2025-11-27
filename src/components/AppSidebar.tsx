
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  CalendarDays,
  UserPlus,
  Building2,
  Plus,
  User,
  MessageCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type MenuOption = 'dashboard' | 'reservas' | 'usuarios' | 'cadastro-usuario' | 'franquias' | 'cadastro-franquia' | 'relatorios' | 'calendario' | 'perfil' | 'whatsapp';

interface AppSidebarProps {
  selectedMenu: MenuOption;
  onMenuSelect: (menu: MenuOption) => void;
}

export function AppSidebar({ selectedMenu, onMenuSelect }: AppSidebarProps) {
  const { canManageUsers, canViewReports, canCreateUsers, canManageFranchises, isSuperAdmin } = usePermissions();

  const menuItems = [
    { key: 'dashboard' as MenuOption, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { key: 'reservas' as MenuOption, label: 'Reservas', icon: Calendar, show: true },
    { key: 'whatsapp' as MenuOption, label: 'WhatsApp', icon: MessageCircle, show: true },
    { key: 'usuarios' as MenuOption, label: 'Usuários', icon: Users, show: canManageUsers() },
    { key: 'cadastro-usuario' as MenuOption, label: 'Cadastrar Usuário', icon: UserPlus, show: canCreateUsers() },
    { key: 'franquias' as MenuOption, label: 'Franquias', icon: Building2, show: canManageFranchises() },
    { key: 'cadastro-franquia' as MenuOption, label: 'Cadastrar Franquia', icon: Plus, show: isSuperAdmin() },
    { key: 'relatorios' as MenuOption, label: 'Relatórios', icon: BarChart3, show: canViewReports() },
    { key: 'calendario' as MenuOption, label: 'Calendário', icon: CalendarDays, show: true },
  ].filter(item => item.show);

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onMenuSelect(item.key)}
                    isActive={selectedMenu === item.key}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
