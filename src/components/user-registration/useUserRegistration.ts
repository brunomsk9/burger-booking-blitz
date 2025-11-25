
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { UserRegistrationFormData } from './types';

export const useUserRegistration = () => {
  const { isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserRegistrationFormData>({
    name: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'viewer'
    });
  };

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
      console.log('Criando usuário com email confirmado:', formData);

      // Chamar edge function que usa Admin API para criar usuário com email confirmado
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        }
      });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast({
          title: 'Erro no Cadastro',
          description: `Não foi possível criar o usuário: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        console.error('Erro retornado pela função:', data.error);
        toast({
          title: 'Erro no Cadastro',
          description: `Não foi possível criar o usuário: ${data.error}`,
          variant: 'destructive',
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Usuário Criado com Sucesso!',
          description: `${formData.name} foi criado e já pode fazer login com a senha definida.`,
        });
        resetForm();
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

  return {
    formData,
    setFormData,
    loading,
    handleSubmit
  };
};
