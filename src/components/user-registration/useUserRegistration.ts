
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
            name: formData.name,
            full_name: formData.name,
            display_name: formData.name
          },
          emailRedirectTo: `${window.location.origin}/`,
          emailSubject: '🦸 Bem-vindo ao Sistema Herois Burguer - Ative sua conta',
          emailBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background-color: #dc2626; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                  🦸
                </div>
                <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Herois Burguer</h1>
                <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestão de Reservas</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="color: #333; margin-top: 0; font-size: 20px;">Olá, ${formData.name}! 👋</h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                  Você foi convidado(a) para acessar o <strong>Sistema de Gestão de Reservas do Herois Burguer</strong>. 
                  Para ativar sua conta e começar a usar o sistema, clique no botão abaixo:
                </p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="{{.ConfirmationURL}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                    ✅ Ativar Minha Conta
                  </a>
                </div>
                
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="color: #1565c0; margin: 0; font-size: 14px;">
                    <strong>🔑 Suas credenciais de acesso:</strong><br>
                    • Email: ${formData.email}<br>
                    • Senha temporária: ${formData.password}<br>
                    • Nível de acesso: ${formData.role === 'viewer' ? 'Visualizador' : formData.role === 'editor' ? 'Editor' : formData.role === 'admin' ? 'Administrador' : 'Super Administrador'}
                  </p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  <strong>O que você poderá fazer no sistema:</strong><br>
                  ${formData.role === 'viewer' ? '• Visualizar reservas e relatórios' : '• Visualizar e gerenciar reservas<br>• Confirmar ou cancelar reservas<br>• Entrar em contato com clientes via WhatsApp<br>• Acompanhar relatórios e estatísticas'}
                  ${formData.role === 'admin' || formData.role === 'superadmin' ? '<br>• Gerenciar usuários e permissões<br>• Acessar relatórios avançados' : ''}
                </p>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Este link de ativação expira em 24 horas. Após ativar sua conta, recomendamos que altere sua senha temporária no primeiro acesso.
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Este email foi enviado pelo Sistema Herois Burguer</p>
                <p>Se você não esperava receber este convite, entre em contato com o administrador do sistema.</p>
              </div>
            </div>
          `
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
            description: `${formData.name} foi convidado para a plataforma. Eles receberão um email personalizado com instruções detalhadas para ativar a conta.`,
          });
        }

        resetForm();
      } else {
        // Usuário pode já existir
        toast({
          title: 'Convite Enviado',
          description: 'Se o usuário não existir no sistema, receberá um email de confirmação personalizado.',
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
