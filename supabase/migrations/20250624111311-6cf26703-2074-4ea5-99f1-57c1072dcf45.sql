
-- Limpar todas as políticas e funções problemáticas
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow superadmin to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow superadmin to update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow view reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "Allow create reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "Allow update reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "Allow delete reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "Allow view user franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Allow superadmin manage user franchises" ON public.user_franchises;

DROP FUNCTION IF EXISTS public.get_user_role_direct(uuid);
DROP FUNCTION IF EXISTS public.get_user_franchise_names(uuid);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Criar função simples para obter role do usuário sem recursão
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Políticas mais simples para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Superadmin pode ver e editar todos os perfis
CREATE POLICY "Superadmin can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.get_user_role() = 'superadmin'
);

CREATE POLICY "Superadmin can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.get_user_role() = 'superadmin'
);

-- Políticas simplificadas para reservations
CREATE POLICY "Allow authenticated users to view reservations" ON public.reservations
FOR SELECT TO authenticated
USING (
  public.get_user_role() IN ('superadmin', 'admin', 'viewer')
);

CREATE POLICY "Allow authenticated users to create reservations" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role() IN ('superadmin', 'admin')
);

CREATE POLICY "Allow authenticated users to update reservations" ON public.reservations
FOR UPDATE TO authenticated
USING (
  public.get_user_role() IN ('superadmin', 'admin')
);

CREATE POLICY "Allow authenticated users to delete reservations" ON public.reservations
FOR DELETE TO authenticated
USING (
  public.get_user_role() IN ('superadmin', 'admin')
);

-- Políticas para user_franchises
CREATE POLICY "Users can view user franchises" ON public.user_franchises
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'superadmin' OR
  user_id = auth.uid()
);

CREATE POLICY "Superadmin can manage user franchises" ON public.user_franchises
FOR ALL TO authenticated
USING (public.get_user_role() = 'superadmin')
WITH CHECK (public.get_user_role() = 'superadmin');

-- Garantir que seu usuário seja superadmin
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email = 'brunomsk9@gmail.com';
