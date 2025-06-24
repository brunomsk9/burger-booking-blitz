import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2, Upload, X, Save } from 'lucide-react';

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    active: true,
    logo_url: ''
  });

  React.useEffect(() => {
    if (franchise) {
      setFormData({
        name: franchise.name,
        company_name: franchise.company_name || '',
        address: franchise.address || '',
        phone: franchise.phone || '',
        email: franchise.email || '',
        manager_name: franchise.manager_name || '',
        active: franchise.active,
        logo_url: franchise.logo_url || ''
      });
      setLogoPreview(franchise.logo_url);
    }
  }, [franchise]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('franchise-logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        toast({
          title: 'Erro',
          description: 'Erro ao fazer upload da logo.',
          variant: 'destructive',
        });
        return;
      }

      const { data } = supabase.storage
        .from('franchise-logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      setLogoPreview(data.publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Logo carregada com sucesso!',
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao fazer upload.',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview(null);
  };

  const updateFranchiseNameInReservations = async (oldName: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ franchise_name: newName })
        .eq('franchise_name', oldName);

      if (error) {
        console.error('Erro ao atualizar reservas:', error);
        toast({
          title: 'Aviso',
          description: 'Franquia atualizada, mas houve erro ao sincronizar algumas reservas.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar reservas:', error);
    }
  };

  const updateFranchiseNameInUserFranchises = async (oldName: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('user_franchises')
        .update({ franchise_name: newName })
        .eq('franchise_name', oldName);

      if (error) {
        console.error('Erro ao atualizar user_franchises:', error);
        toast({
          title: 'Aviso',
          description: 'Franquia atualizada, mas houve erro ao sincronizar alguns vínculos de usuário.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar user_franchises:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchise) return;

    setLoading(true);

    try {
      console.log('Atualizando franquia:', formData);

      // Se o nome da empresa mudou, precisamos atualizar em todo o sistema
      const companyNameChanged = franchise.company_name !== formData.company_name;
      const oldCompanyName = franchise.company_name || franchise.name;
      const newCompanyName = formData.company_name || formData.name;

      const { error } = await supabase
        .from('franchises')
        .update({
          company_name: formData.company_name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          manager_name: formData.manager_name,
          active: formData.active,
          logo_url: formData.logo_url
        })
        .eq('id', franchise.id);

      if (error) {
        console.error('Erro ao atualizar franquia:', error);
        toast({
          title: 'Erro',
          description: `Erro ao atualizar franquia: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Se o nome da empresa mudou, atualizar em reservas e user_franchises
      if (companyNameChanged) {
        await Promise.all([
          updateFranchiseNameInReservations(oldCompanyName, newCompanyName),
          updateFranchiseNameInUserFranchises(oldCompanyName, newCompanyName)
        ]);
      }

      toast({
        title: 'Sucesso!',
        description: `Franquia ${formData.company_name || formData.name} atualizada com sucesso!`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
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
        logo_url: franchise.logo_url || ''
      });
      setLogoPreview(franchise.logo_url);
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
            <div>
              <Label htmlFor="edit-name">Nome da Franquia (ID)</Label>
              <Input
                id="edit-name"
                value={formData.name}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="nome-unico-franquia"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Identificador único (não pode ser alterado)
              </p>
            </div>

            <div>
              <Label htmlFor="edit-company-name">Nome da Empresa</Label>
              <Input
                id="edit-company-name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                required
                placeholder="Herois Burguer - Unidade Centro"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nome exibido para os clientes
              </p>
            </div>

            <div className="md:col-span-2">
              <Label>Logo da Franquia</Label>
              <div className="mt-2 space-y-4">
                {logoPreview ? (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Clique para selecionar uma logo
                    </p>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingLogo && (
                    <p className="text-sm text-gray-600 mt-1">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-1" />
                      Fazendo upload...
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Endereço completo da franquia"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@franquia.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="edit-manager">Nome do Gerente</Label>
              <Input
                id="edit-manager"
                value={formData.manager_name}
                onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                placeholder="Nome do gerente responsável"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
                <Label htmlFor="edit-active">Franquia Ativa</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || uploadingLogo}
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
