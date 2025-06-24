
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

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      console.log('🏗️ Iniciando upload da logo...');
      
      // Primeiro, vamos verificar se o bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('📦 Buckets disponíveis:', buckets);
      
      if (bucketsError) {
        console.error('❌ Erro ao listar buckets:', bucketsError);
        throw bucketsError;
      }

      const franchiseLogosBucket = buckets?.find(bucket => bucket.name === 'franchise-logos');
      
      if (!franchiseLogosBucket) {
        console.log('📦 Bucket franchise-logos não encontrado, tentando criar...');
        
        // Tentar criar o bucket se não existir
        const { data: newBucket, error: createBucketError } = await supabase.storage.createBucket('franchise-logos', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (createBucketError) {
          console.error('❌ Erro ao criar bucket:', createBucketError);
          
          // Se não conseguir criar, usar um método alternativo
          toast({
            title: 'Aviso',
            description: 'Usando URL temporária para a logo. Contate o administrador para configurar o storage.',
            variant: 'default',
          });
          
          // Criar uma URL temporária usando FileReader
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onLogoChange(dataUrl);
            setLogoPreview(dataUrl);
            
            toast({
              title: 'Sucesso',
              description: 'Logo carregada temporariamente!',
            });
          };
          reader.readAsDataURL(file);
          return;
        }

        console.log('✅ Bucket criado com sucesso:', newBucket);
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      console.log('📤 Fazendo upload do arquivo:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('franchise-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro ao fazer upload:', uploadError);
        
        // Fallback para usar data URL local
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          onLogoChange(dataUrl);
          setLogoPreview(dataUrl);
          
          toast({
            title: 'Logo salva localmente',
            description: 'A logo foi carregada temporariamente. Para salvar permanentemente, contate o administrador.',
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      console.log('✅ Upload realizado com sucesso');

      const { data } = supabase.storage
        .from('franchise-logos')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log('🔗 URL pública gerada:', publicUrl);

      onLogoChange(publicUrl);
      setLogoPreview(publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Logo carregada com sucesso!',
      });
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      
      // Fallback final - usar data URL
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          onLogoChange(dataUrl);
          setLogoPreview(dataUrl);
          
          toast({
            title: 'Logo carregada localmente',
            description: 'A logo foi carregada temporariamente.',
          });
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a imagem.',
          variant: 'destructive',
        });
      }
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
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem:', e);
                setLogoPreview(null);
              }}
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
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF até 5MB
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
