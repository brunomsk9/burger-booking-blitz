
-- Limpar todas as políticas problemáticas e funções existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view reservations based on role" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations based on role" ON public.reservations;
DROP POLICY IF EXISTS "Users can update reservations based on role" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete reservations based on role" ON public.reservations;
DROP POLICY IF EXISTS "Users can view user_franchises based on role" ON public.user_franchises;
DROP POLICY IF EXISTS "Only superadmins can manage user_franchises" ON public.user_franchises;

DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_user_franchises(uuid);

-- Criar funções mais simples e diretas (sem recursão)
CREATE OR REPLACE FUNCTION public.get_user_role_direct(user_uuid UUID)
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_franchise_names(user_uuid UUID)
RETURNS TABLE(franchise_name TEXT)
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT uf.franchise_name 
  FROM public.user_franchises uf 
  WHERE uf.user_id = user_uuid;
$$;

-- Políticas mais simples para profiles
CREATE POLICY "Allow users to view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow superadmin to view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.get_user_role_direct(auth.uid()) = 'superadmin'
);

CREATE POLICY "Allow superadmin to update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.get_user_role_direct(auth.uid()) = 'superadmin'
);

-- Políticas para reservations
CREATE POLICY "Allow view reservations by role" ON public.reservations
FOR SELECT TO authenticated
USING (
  public.get_user_role_direct(auth.uid()) = 'superadmin' OR
  (
    public.get_user_role_direct(auth.uid()) IN ('admin', 'viewer') AND 
    franchise_name IN (SELECT franchise_name FROM public.get_user_franchise_names(auth.uid()))
  )
);

CREATE POLICY "Allow create reservations by role" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role_direct(auth.uid()) = 'superadmin' OR
  (
    public.get_user_role_direct(auth.uid()) = 'admin' AND 
    franchise_name IN (SELECT franchise_name FROM public.get_user_franchise_names(auth.uid()))
  )
);

CREATE POLICY "Allow update reservations by role" ON public.reservations
FOR UPDATE TO authenticated
USING (
  public.get_user_role_direct(auth.uid()) = 'superadmin' OR
  (
    public.get_user_role_direct(auth.uid()) = 'admin' AND 
    franchise_name IN (SELECT franchise_name FROM public.get_user_franchise_names(auth.uid()))
  )
);

CREATE POLICY "Allow delete reservations by role" ON public.reservations
FOR DELETE TO authenticated
USING (
  public.get_user_role_direct(auth.uid()) = 'superadmin' OR
  (
    public.get_user_role_direct(auth.uid()) = 'admin' AND 
    franchise_name IN (SELECT franchise_name FROM public.get_user_franchise_names(auth.uid()))
  )
);

-- Políticas para user_franchises
CREATE POLICY "Allow view user franchises" ON public.user_franchises
FOR SELECT TO authenticated
USING (
  public.get_user_role_direct(auth.uid()) = 'superadmin' OR
  user_id = auth.uid()
);

CREATE POLICY "Allow superadmin manage user franchises" ON public.user_franchises
FOR ALL TO authenticated
USING (public.get_user_role_direct(auth.uid()) = 'superadmin')
WITH CHECK (public.get_user_role_direct(auth.uid()) = 'superadmin');
