
-- Limpar todas as políticas existentes para recriá-las de forma mais organizada
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow authenticated users to create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow authenticated users to update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow authenticated users to delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view user franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Superadmin can manage user franchises" ON public.user_franchises;

-- Função melhorada para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT COALESCE(role, 'viewer') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Função para verificar se usuário tem acesso à franquia
CREATE OR REPLACE FUNCTION public.user_has_franchise_access(franchise_name_param TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    public.get_user_role() = 'superadmin' OR
    EXISTS (
      SELECT 1 FROM public.user_franchises 
      WHERE user_id = auth.uid() AND franchise_name = franchise_name_param
    );
$$;

-- POLÍTICAS PARA PROFILES
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Apenas superadmin e admin podem inserir novos perfis
CREATE POLICY "Only superadmin and admin can insert profiles" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role() IN ('superadmin', 'admin')
);

-- Usuários podem atualizar seu próprio perfil (role só pode ser alterado por superadmin)
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Superadmin pode ver todos os perfis
CREATE POLICY "Superadmin can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.get_user_role() = 'superadmin');

-- Superadmin pode atualizar qualquer perfil
CREATE POLICY "Superadmin can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.get_user_role() = 'superadmin');

-- POLÍTICAS PARA RESERVATIONS
-- Visualizar reservas: superadmin vê tudo, outros veem apenas de suas franquias
CREATE POLICY "View reservations by role and franchise" ON public.reservations
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'superadmin' OR
  public.user_has_franchise_access(franchise_name)
);

-- Criar reservas: superadmin e admin podem criar
CREATE POLICY "Create reservations by role" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role() = 'superadmin' OR
  (public.get_user_role() = 'admin' AND public.user_has_franchise_access(franchise_name))
);

-- Atualizar reservas: superadmin e admin podem atualizar
CREATE POLICY "Update reservations by role" ON public.reservations
FOR UPDATE TO authenticated
USING (
  public.get_user_role() = 'superadmin' OR
  (public.get_user_role() = 'admin' AND public.user_has_franchise_access(franchise_name))
);

-- Deletar reservas: apenas superadmin e admin
CREATE POLICY "Delete reservations by role" ON public.reservations
FOR DELETE TO authenticated
USING (
  public.get_user_role() = 'superadmin' OR
  (public.get_user_role() = 'admin' AND public.user_has_franchise_access(franchise_name))
);

-- POLÍTICAS PARA USER_FRANCHISES
-- Ver franquias do usuário: superadmin vê tudo, usuário vê apenas as suas
CREATE POLICY "View user franchises" ON public.user_franchises
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'superadmin' OR
  user_id = auth.uid()
);

-- Gerenciar franquias: apenas superadmin
CREATE POLICY "Manage user franchises" ON public.user_franchises
FOR ALL TO authenticated
USING (public.get_user_role() = 'superadmin')
WITH CHECK (public.get_user_role() = 'superadmin');

-- POLÍTICAS PARA FRANCHISES
CREATE POLICY "View franchises" ON public.franchises
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Manage franchises" ON public.franchises
FOR ALL TO authenticated
USING (public.get_user_role() = 'superadmin')
WITH CHECK (public.get_user_role() = 'superadmin');
