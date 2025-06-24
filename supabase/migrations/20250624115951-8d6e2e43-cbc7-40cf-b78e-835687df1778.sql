
-- Criar tabela para armazenar franquias
CREATE TABLE public.franchises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  manager_name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Habilitar RLS
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;

-- Política para visualizar franquias (todos os usuários autenticados podem ver)
CREATE POLICY "Users can view franchises" 
  ON public.franchises 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para criar franquias (apenas superadmin)
CREATE POLICY "Superadmin can create franchises" 
  ON public.franchises 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Política para atualizar franquias (apenas superadmin)
CREATE POLICY "Superadmin can update franchises" 
  ON public.franchises 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Política para deletar franquias (apenas superadmin)
CREATE POLICY "Superadmin can delete franchises" 
  ON public.franchises 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.franchises 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
