-- Atualizar policies para permitir que editores possam atualizar e deletar reservas
DROP POLICY IF EXISTS "Update reservations by role" ON public.reservations;
DROP POLICY IF EXISTS "Delete reservations by role" ON public.reservations;

-- Policy de UPDATE: superadmin, admin e editor com acesso à franquia
CREATE POLICY "Update reservations by role"
ON public.reservations
FOR UPDATE
USING (
  (get_user_role() = 'superadmin') OR
  ((get_user_role() = 'admin' OR get_user_role() = 'editor') AND user_has_franchise_access(franchise_name))
);

-- Policy de DELETE: superadmin, admin e editor com acesso à franquia
CREATE POLICY "Delete reservations by role"
ON public.reservations
FOR DELETE
USING (
  (get_user_role() = 'superadmin') OR
  ((get_user_role() = 'admin' OR get_user_role() = 'editor') AND user_has_franchise_access(franchise_name))
);