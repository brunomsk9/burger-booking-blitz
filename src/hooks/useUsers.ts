
import { useUserData } from './useUserData';
import { useUserRoleActions } from './useUserRoleActions';
import { useUserFranchiseActions } from './useUserFranchiseActions';

export const useUsers = () => {
  const { users, userFranchises, loading, setUsers, setUserFranchises, refetch } = useUserData();
  const { updateUserRole } = useUserRoleActions(setUsers);
  const { assignUserToFranchise, removeUserFromFranchise } = useUserFranchiseActions(setUserFranchises);

  return {
    users,
    userFranchises,
    loading,
    updateUserRole,
    assignUserToFranchise,
    removeUserFromFranchise,
    refetch,
  };
};
