
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

        resetForm();
      } else {
        // Usuário pode já existir
        toast({
          title: 'Convite Enviado',
          description: 'Se o usuário não existir no sistema, receberá um email de confirmação.',
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
