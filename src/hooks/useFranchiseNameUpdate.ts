
import { supabase } from '@/integrations/supabase/client';

export const useFranchiseNameUpdate = () => {
  const updateFranchiseNameInReservations = async (oldName: string, newName: string) => {
    try {
      console.log('🔄 Updating reservations from', oldName, 'to', newName);
      const { error } = await supabase
        .from('reservations')
        .update({ franchise_name: newName })
        .eq('franchise_name', oldName);

      if (error) {
        console.error('❌ Error updating reservations:', error);
        return false;
      }
      console.log('✅ Reservations updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error updating reservations:', error);
      return false;
    }
  };

  const updateFranchiseNameInUserFranchises = async (oldName: string, newName: string) => {
    try {
      console.log('🔄 Updating user_franchises from', oldName, 'to', newName);
      const { error } = await supabase
        .from('user_franchises')
        .update({ franchise_name: newName })
        .eq('franchise_name', oldName);

      if (error) {
        console.error('❌ Error updating user_franchises:', error);
        return false;
      }
      console.log('✅ User franchises updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error updating user_franchises:', error);
      return false;
    }
  };

  return {
    updateFranchiseNameInReservations,
    updateFranchiseNameInUserFranchises,
  };
};
