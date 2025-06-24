
import { useAuth } from './useAuth';
import { UserProfile } from '@/types/user';

export const usePermissions = () => {
  const { userProfile } = useAuth();

  const isSuperAdmin = () => {
    return userProfile?.role === 'superadmin';
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isViewer = () => {
    return userProfile?.role === 'viewer';
  };

  const isEditor = () => {
    return userProfile?.role === 'editor';
  };

  const canManageUsers = () => {
    return isSuperAdmin();
  };

  const canManageReservations = () => {
    return isSuperAdmin() || isAdmin();
  };

  const canViewReservations = () => {
    return isSuperAdmin() || isAdmin() || isViewer();
  };

  const canCreateReservations = () => {
    return isSuperAdmin() || isAdmin();
  };

  const canUpdateReservations = () => {
    return isSuperAdmin() || isAdmin();
  };

  const canDeleteReservations = () => {
    return isSuperAdmin() || isAdmin();
  };

  const canManageUserFranchises = () => {
    return isSuperAdmin();
  };

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
    getUserRole,
    getRoleText,
  };
};
