
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRegistrationFormData, RoleOption } from './types';

interface UserRegistrationFormProps {
  formData: UserRegistrationFormData;
  setFormData: (data: UserRegistrationFormData) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  formData,
  setFormData,
  loading,
  onSubmit
}) => {
  const { isSuperAdmin } = usePermissions();

  // Função para filtrar as opções de papel baseado no usuário atual
  const getAvailableRoles = (): RoleOption[] => {
    const allRoles = [
      { value: 'viewer', label: 'Visualizador' },
      { value: 'editor', label: 'Editor' },
      { value: 'admin', label: 'Administrador' },
      { value: 'superadmin', label: 'Super Administrador' }
    ];

    // Se não é super admin, remove a opção de super admin
    if (!isSuperAdmin()) {
      return allRoles.filter(role => role.value !== 'superadmin');
    }

    return allRoles;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Nome completo do usuário"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="usuario@empresa.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Senha Inicial</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            placeholder="Senha inicial (mínimo 6 caracteres)"
            minLength={6}
          />
        </div>
        
        <div>
          <Label htmlFor="role">Nível de Acesso</Label>
          <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nível de acesso" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableRoles().map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>📧 Processo de Convite:</strong> O usuário receberá um email de boas-vindas com instruções para ativar sua conta. 
          A senha fornecida será temporária e poderá ser alterada no primeiro acesso.
          {!isSuperAdmin() && (
            <>
              <br />
              <br />
              <strong>⚠️ Limitação de Acesso:</strong> Como administrador, você não pode criar Super Administradores. Esta função é restrita aos Super Administradores existentes.
            </>
          )}
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando convite...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Enviar Convite
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserRegistrationForm;
