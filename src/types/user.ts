
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface UserFranchise {
  id: string;
  user_id: string;
  franchise_name: string;
  created_at: string;
}
