-- Adicionar campos de personalização visual nas franquias
ALTER TABLE franchises 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3b82f6';

-- Criar bucket de storage para logos das franquias
INSERT INTO storage.buckets (id, name, public)
VALUES ('franchise-logos', 'franchise-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can view franchise logos" ON storage.objects;
DROP POLICY IF EXISTS "Superadmin can upload franchise logos" ON storage.objects;
DROP POLICY IF EXISTS "Superadmin can update franchise logos" ON storage.objects;
DROP POLICY IF EXISTS "Superadmin can delete franchise logos" ON storage.objects;

-- Política para visualizar logos (público)
CREATE POLICY "Anyone can view franchise logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'franchise-logos');

-- Política para superadmin fazer upload de logos
CREATE POLICY "Superadmin can upload franchise logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'franchise-logos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
);

-- Política para superadmin atualizar logos
CREATE POLICY "Superadmin can update franchise logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'franchise-logos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
);

-- Política para superadmin deletar logos
CREATE POLICY "Superadmin can delete franchise logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'franchise-logos' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
);
