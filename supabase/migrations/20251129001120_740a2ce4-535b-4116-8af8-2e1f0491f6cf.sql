-- Remove política que permite leitura anônima de reservas
DROP POLICY IF EXISTS "Allow anonymous users to view reservations" ON public.reservations;

-- Garante que a política de INSERT permite usuários anônimos (para formulário público)
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;

CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- As demais políticas de SELECT já existem e restringem leitura apenas para:
-- 1. "View reservations by role and franchise" - usuários autenticados com acesso à franquia
-- 2. "reservations_select" - superadmin, admin e viewer autenticados