
-- Criar tabela para relação usuário-franquia
CREATE TABLE public.user_franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  franchise_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, franchise_name)
);

-- Habilitar RLS na tabela user_franchises
ALTER TABLE public.user_franchises ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_franchises
CREATE POLICY "Usuários autenticados podem ver todas as relações usuário-franquia"
  ON public.user_franchises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar relações usuário-franquia"
  ON public.user_franchises FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Atualizar políticas de reservas para considerar franquias do usuário
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as reservas" ON public.reservations;
CREATE POLICY "Usuários podem ver reservas de suas franquias"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.user_franchises uf ON p.id = uf.user_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR uf.franchise_name = franchise_name)
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem criar reservas" ON public.reservations;
CREATE POLICY "Usuários podem criar reservas em suas franquias"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.user_franchises uf ON p.id = uf.user_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR uf.franchise_name = franchise_name)
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar reservas" ON public.reservations;
CREATE POLICY "Usuários podem atualizar reservas de suas franquias"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.user_franchises uf ON p.id = uf.user_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR uf.franchise_name = franchise_name)
    )
  );
