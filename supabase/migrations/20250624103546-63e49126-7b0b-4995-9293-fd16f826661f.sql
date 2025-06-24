
-- Fix infinite recursion in RLS policies by creating a security definer function
-- and simplifying the policies

-- First, create a security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view reservations of their franchises" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations in their franquias" ON public.reservations;
DROP POLICY IF EXISTS "Users can update reservations of their franchises" ON public.reservations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.reservations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.reservations;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Create simple policies for reservations that allow all authenticated users
CREATE POLICY "Authenticated users can view reservations" ON public.reservations
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create reservations" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reservations" ON public.reservations
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reservations" ON public.reservations
FOR DELETE TO authenticated
USING (true);

-- Create simple policies for user_franchises
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_franchises;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_franchises;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_franchises;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_franchises;

CREATE POLICY "Authenticated users can view user_franchises" ON public.user_franchises
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage user_franchises" ON public.user_franchises
FOR ALL TO authenticated
USING (true);
