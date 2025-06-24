
export interface UserRegistrationFormData {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
}

export interface RoleOption {
  value: string;
  label: string;
}
