-- Remove políticas conflitantes de INSERT na tabela reservations
DROP POLICY IF EXISTS "Allow anonymous users to create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Create reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "reservations_insert" ON public.reservations;

-- Cria uma única política permissiva para INSERT que permite:
-- 1. Usuários anônimos (para formulário público)
-- 2. Editores com acesso à franquia
-- 3. Admins e superadmins
CREATE POLICY "Users can create reservations" ON public.reservations
FOR INSERT
WITH CHECK (
  -- Permite todos (incluindo anônimos) para formulário público
  true
  OR
  -- OU usuário autenticado com permissões
  (auth.uid() IS NOT NULL AND (
    get_user_role() = 'superadmin'
    OR (get_user_role() = 'admin' AND user_has_franchise_access(franchise_name))
    OR (get_user_role() = 'editor' AND user_has_franchise_access(franchise_name))
  ))
);