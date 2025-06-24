
-- Drop all existing problematic policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can view user_franchises" ON public.user_franchises;
DROP POLICY IF EXISTS "Authenticated users can manage user_franchises" ON public.user_franchises;

-- Update the profiles table to include 'superadmin' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('superadmin', 'admin', 'editor', 'viewer'));

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_franchises(user_uuid UUID)
RETURNS TABLE(franchise_name TEXT)
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT uf.franchise_name 
  FROM public.user_franchises uf 
  WHERE uf.user_id = user_uuid;
$$;

-- Profiles policies - users can manage their own profile, superadmins can manage all
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'superadmin'
);

-- Reservations policies based on user roles and franchises
CREATE POLICY "Users can view reservations based on role" ON public.reservations
FOR SELECT TO authenticated
USING (
  public.get_current_user_role() = 'superadmin' OR
  (public.get_current_user_role() IN ('admin', 'viewer') AND 
   franchise_name IN (SELECT franchise_name FROM public.get_user_franchises(auth.uid())))
);

CREATE POLICY "Users can create reservations based on role" ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (
  public.get_current_user_role() = 'superadmin' OR
  (public.get_current_user_role() = 'admin' AND 
   franchise_name IN (SELECT franchise_name FROM public.get_user_franchises(auth.uid())))
);

CREATE POLICY "Users can update reservations based on role" ON public.reservations
FOR UPDATE TO authenticated
USING (
  public.get_current_user_role() = 'superadmin' OR
  (public.get_current_user_role() = 'admin' AND 
   franchise_name IN (SELECT franchise_name FROM public.get_user_franchises(auth.uid())))
);

CREATE POLICY "Users can delete reservations based on role" ON public.reservations
FOR DELETE TO authenticated
USING (
  public.get_current_user_role() = 'superadmin' OR
  (public.get_current_user_role() = 'admin' AND 
   franchise_name IN (SELECT franchise_name FROM public.get_user_franchises(auth.uid())))
);

-- User franchises policies - only superadmins can manage these relationships
CREATE POLICY "Users can view user_franchises based on role" ON public.user_franchises
FOR SELECT TO authenticated
USING (
  public.get_current_user_role() = 'superadmin' OR
  user_id = auth.uid()
);

CREATE POLICY "Only superadmins can manage user_franchises" ON public.user_franchises
FOR ALL TO authenticated
USING (public.get_current_user_role() = 'superadmin')
WITH CHECK (public.get_current_user_role() = 'superadmin');
