import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2, Save } from 'lucide-react';
import FranchiseLogoUpload from './franchise/FranchiseLogoUpload';
import FranchiseFormFields from './franchise/FranchiseFormFields';
import { useFranchiseNameUpdate } from '@/hooks/useFranchiseNameUpdate';

interface Franchise {
  id: string;
  name: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  active: boolean;
  logo_url: string | null;
  created_at: string;
  webhook_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  slug: string | null;
}

interface FranchiseEditorProps {
  franchise: Franchise | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const FranchiseEditor: React.FC<FranchiseEditorProps> = ({
  franchise,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    active: true,
    logo_url: '',
    webhook_url: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    accent_color: '#3b82f6',
    slug: ''
  });

  const { updateFranchiseNameInReservations, updateFranchiseNameInUserFranchises } = useFranchiseNameUpdate();

  React.useEffect(() => {
    if (franchise) {
      console.log('🏢 Setting form data for franchise:', franchise);
      setFormData({
        name: franchise.name,
        company_name: franchise.company_name || '',
        address: franchise.address || '',
        phone: franchise.phone || '',
        email: franchise.email || '',
        manager_name: franchise.manager_name || '',
        active: franchise.active,
        logo_url: franchise.logo_url || '',
        webhook_url: franchise.webhook_url || '',
        primary_color: franchise.primary_color || '#2563eb',
        secondary_color: franchise.secondary_color || '#1e40af',
        accent_color: franchise.accent_color || '#3b82f6',
        slug: franchise.slug || ''
      });
    }
  }, [franchise]);

  const handleLogoChange = (url: string) => {
    setFormData(prev => ({ ...prev, logo_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchise) return;

    setLoading(true);

    try {
      console.log('🏢 Updating franchise with data:', formData);
      console.log('🏢 Original franchise:', franchise);

      // Determinar o nome antigo e novo para comparação
      const oldCompanyName = franchise.company_name || franchise.name;
      const newCompanyName = formData.company_name || formData.name;
      const companyNameChanged = oldCompanyName !== newCompanyName;

      console.log('🏢 Company name change check:', {
        oldCompanyName,
        newCompanyName,
        companyNameChanged
      });

      // Atualizar a franquia
      const { error } = await supabase
        .from('franchises')
        .update({
          company_name: formData.company_name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          manager_name: formData.manager_name,
          active: formData.active,
          logo_url: formData.logo_url,
          webhook_url: formData.webhook_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          slug: formData.slug
        })
        .eq('id', franchise.id);

      if (error) {
        console.error('❌ Error updating franchise:', error);
        toast({
          title: 'Erro',
          description: `Erro ao atualizar franquia: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Franchise updated successfully');

      // Se o nome da empresa mudou, atualizar em todo o sistema
      if (companyNameChanged) {
        console.log('🔄 Company name changed, updating related records...');
        
        const [reservationsUpdated, userFranchisesUpdated] = await Promise.all([
          updateFranchiseNameInReservations(oldCompanyName, newCompanyName),
          updateFranchiseNameInUserFranchises(oldCompanyName, newCompanyName)
        ]);

        if (!reservationsUpdated || !userFranchisesUpdated) {
          toast({
            title: 'Aviso',
            description: 'Franquia atualizada, mas houve problemas ao sincronizar alguns dados relacionados.',
            variant: 'destructive',
          });
        } else {
          console.log('✅ All related records updated successfully');
        }
      }

      toast({
        title: 'Sucesso!',
        description: `Franquia ${newCompanyName} atualizada com sucesso!`,
      });

      // Invalidar cache e fechar modal
      onUpdate();
      onClose();
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar franquia.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (franchise) {
      setFormData({
        name: franchise.name,
        company_name: franchise.company_name || '',
        address: franchise.address || '',
        phone: franchise.phone || '',
        email: franchise.email || '',
        manager_name: franchise.manager_name || '',
        active: franchise.active,
        logo_url: franchise.logo_url || '',
        webhook_url: franchise.webhook_url || '',
        primary_color: franchise.primary_color || '#2563eb',
        secondary_color: franchise.secondary_color || '#1e40af',
        accent_color: franchise.accent_color || '#3b82f6',
        slug: franchise.slug || ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Editar Franquia
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FranchiseFormFields 
              formData={formData} 
              onFormDataChange={setFormData} 
            />
            
            <FranchiseLogoUpload
              logoUrl={formData.logo_url}
              onLogoChange={handleLogoChange}
            />
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
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FranchiseEditor;
