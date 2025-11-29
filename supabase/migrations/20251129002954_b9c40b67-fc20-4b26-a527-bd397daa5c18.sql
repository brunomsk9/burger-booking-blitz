-- Permitir que usuários anônimos vejam franquias ativas
-- Isso é necessário para a VIEW franchises_public funcionar
CREATE POLICY "Anonymous users can view active franchises for public reservations"
ON public.franchises
FOR SELECT
TO anon
USING (active = true);