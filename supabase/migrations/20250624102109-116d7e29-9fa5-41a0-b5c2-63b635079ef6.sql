
-- Remove todas as políticas RLS existentes na tabela profiles para evitar recursão
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Desabilita RLS temporariamente na tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Reabilita RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cria políticas RLS simples e sem recursão para a tabela profiles
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Remove todas as políticas RLS existentes na tabela reservations
DROP POLICY IF EXISTS "Users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete reservations" ON public.reservations;

-- Desabilita RLS temporariamente na tabela reservations
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Reabilita RLS na tabela reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Cria políticas RLS simples para reservations
CREATE POLICY "Enable read access for authenticated users" ON public.reservations
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.reservations
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.reservations
FOR DELETE TO authenticated
USING (true);

-- Remove todas as políticas RLS existentes na tabela user_franchises
DROP POLICY IF EXISTS "Users can view user_franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Users can create user_franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Users can update user_franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Users can delete user_franchises" ON public.user_franchises;

-- Desabilita RLS temporariamente na tabela user_franchises
ALTER TABLE public.user_franchises DISABLE ROW LEVEL SECURITY;

-- Reabilita RLS na tabela user_franchises
ALTER TABLE public.user_franchises ENABLE ROW LEVEL SECURITY;

-- Cria políticas RLS simples para user_franchises
CREATE POLICY "Enable read access for authenticated users" ON public.user_franchises
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.user_franchises
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.user_franchises
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.user_franchises
FOR DELETE TO authenticated
USING (true);
