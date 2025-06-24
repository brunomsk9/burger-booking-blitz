
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';

interface FranchiseLogoUploadProps {
  logoUrl: string;
  onLogoChange: (url: string) => void;
}

const FranchiseLogoUpload: React.FC<FranchiseLogoUploadProps> = ({
  logoUrl,
  onLogoChange
}) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl);

  React.useEffect(() => {
    setLogoPreview(logoUrl);
  }, [logoUrl]);

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

      onLogoChange(data.publicUrl);
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
    onLogoChange('');
    setLogoPreview(null);
  };

  return (
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
  );
};

export default FranchiseLogoUpload;
