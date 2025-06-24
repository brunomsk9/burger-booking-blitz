
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import { UserPlus } from 'lucide-react';
import AccessDenied from './user-registration/AccessDenied';
import UserRegistrationForm from './user-registration/UserRegistrationForm';
import { useUserRegistration } from './user-registration/useUserRegistration';

const UserRegistration: React.FC = () => {
  const { canCreateUsers } = usePermissions();
  const { formData, setFormData, loading, handleSubmit } = useUserRegistration();

  if (!canCreateUsers()) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Cadastro de Usuários</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Convidar Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UserRegistrationForm
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistration;
