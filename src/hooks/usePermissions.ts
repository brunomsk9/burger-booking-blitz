
import { useAuth } from './useAuth';
import { UserProfile } from '@/types/user';

export const usePermissions = () => {
  const { userProfile } = useAuth();

  const isSuperAdmin = () => userProfile?.role === 'superadmin';
  const isAdmin = () => userProfile?.role === 'admin';
  const isViewer = () => userProfile?.role === 'viewer';
  const isEditor = () => userProfile?.role === 'editor';
  
  const canManageUsers = () => isSuperAdmin() || isAdmin();
  const canManageReservations = () => isSuperAdmin() || isAdmin();
  const canViewReservations = () => isSuperAdmin() || isAdmin() || isViewer() || isEditor();
  const canCreateReservations = () => isSuperAdmin() || isAdmin() || isEditor();
  const canUpdateReservations = () => isSuperAdmin() || isAdmin() || isEditor();
  const canDeleteReservations = () => isSuperAdmin() || isAdmin() || isEditor();
  const canManageUserFranchises = () => isSuperAdmin();
  const canViewReports = () => isSuperAdmin() || isAdmin();
  const canCreateUsers = () => isSuperAdmin() || isAdmin();
  const canManageFranchises = () => isSuperAdmin() || isAdmin();

  const getUserRole = (): UserProfile['role'] | null => {
    return userProfile?.role || null;
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return {
    userProfile,
    isSuperAdmin,
    isAdmin,
    isViewer,
    isEditor,
    canManageUsers,
    canManageReservations,
    canViewReservations,
    canCreateReservations,
    canUpdateReservations,
    canDeleteReservations,
    canManageUserFranchises,
    canViewReports,
    canCreateUsers,
    canManageFranchises,
    getUserRole,
    getRoleText,
  };
};
