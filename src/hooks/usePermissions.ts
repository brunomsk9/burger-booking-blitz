
import { useAuth } from './useAuth';
import { UserProfile } from '@/types/user';

export const usePermissions = () => {
  const { userProfile } = useAuth();

  console.log('🔐 usePermissions - userProfile:', userProfile);

  const isSuperAdmin = () => {
    const result = userProfile?.role === 'superadmin';
    console.log('🔐 isSuperAdmin:', result, 'role:', userProfile?.role);
    return result;
  };

  const isAdmin = () => {
    const result = userProfile?.role === 'admin';
    console.log('🔐 isAdmin:', result, 'role:', userProfile?.role);
    return result;
  };

  const isViewer = () => {
    const result = userProfile?.role === 'viewer';
    console.log('🔐 isViewer:', result, 'role:', userProfile?.role);
    return result;
  };

  const isEditor = () => {
    const result = userProfile?.role === 'editor';
    console.log('🔐 isEditor:', result, 'role:', userProfile?.role);
    return result;
  };

  const canManageUsers = () => {
    const result = isSuperAdmin() || isAdmin();
    console.log('🔐 canManageUsers:', result);
    return result;
  };

  const canManageReservations = () => {
    const result = isSuperAdmin() || isAdmin();
    console.log('🔐 canManageReservations:', result);
    return result;
  };

  const canViewReservations = () => {
    const result = isSuperAdmin() || isAdmin() || isViewer() || isEditor();
    console.log('🔐 canViewReservations:', result);
    return result;
  };

  const canCreateReservations = () => {
    const result = isSuperAdmin() || isAdmin() || isEditor();
    console.log('🔐 canCreateReservations:', result);
    return result;
  };

  const canUpdateReservations = () => {
    const result = isSuperAdmin() || isAdmin() || isEditor();
    console.log('🔐 canUpdateReservations:', result);
    return result;
  };

  const canDeleteReservations = () => {
    const result = isSuperAdmin() || isAdmin() || isEditor();
    console.log('🔐 canDeleteReservations:', result);
    return result;
  };

  const canManageUserFranchises = () => {
    const result = isSuperAdmin();
    console.log('🔐 canManageUserFranchises:', result);
    return result;
  };

  const canViewReports = () => {
    const result = isSuperAdmin() || isAdmin();
    console.log('🔐 canViewReports:', result);
    return result;
  };

  const canCreateUsers = () => {
    const result = isSuperAdmin() || isAdmin();
    console.log('🔐 canCreateUsers:', result);
    return result;
  };

  const canManageFranchises = () => {
    const result = isSuperAdmin() || isAdmin();
    console.log('🔐 canManageFranchises:', result);
    return result;
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
    canViewReports,
    canCreateUsers,
    canManageFranchises,
    getUserRole,
    getRoleText,
  };
};
