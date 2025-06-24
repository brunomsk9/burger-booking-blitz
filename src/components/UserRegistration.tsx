
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Loader2, ShieldAlert } from 'lucide-react';

const UserRegistration: React.FC = () => {
  const { canCreateUsers, isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as 'superadmin' | 'admin' | 'editor' | 'viewer'
  });

  if (!canCreateUsers()) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ShieldAlert size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
        <p className="text-gray-600">Você não tem permissão para cadastrar usuários.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se admin está tentando criar superadmin
    if (!isSuperAdmin() && formData.role === 'superadmin') {
      toast({
        title: 'Erro de Permissão',
        description: 'Apenas Super Administradores podem criar outros Super Administradores.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Criando convite para usuário:', formData);

      // Usar signUp normal que criará o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast({
          title: 'Erro no Cadastro',
          description: `Não foi possível criar o usuário: ${authError.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (authData.user) {
        // Aguardar um pouco para o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Atualizar o role do usuário criado usando update diretamente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: formData.role })
          .eq('email', formData.email);

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
          toast({
            title: 'Usuário Criado Parcialmente',
            description: 'O usuário foi criado, mas não foi possível definir o papel. Por favor, ajuste manualmente na gestão de usuários.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Usuário Convidado com Sucesso!',
            description: `${formData.name} foi convidado para a plataforma. Eles receberão um email de boas-vindas com instruções para ativar a conta.`,
          });
        }

        // Limpar formulário
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'viewer'
        });
      } else {
        // Usuário pode já existir
        toast({
          title: 'Convite Enviado',
          description: 'Se o usuário não existir no sistema, receberá um email de confirmação.',
        });
        
        // Limpar formulário mesmo assim
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'viewer'
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro inesperado ao criar o usuário. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar as opções de papel baseado no usuário atual
  const getAvailableRoles = () => {
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRegistration;
