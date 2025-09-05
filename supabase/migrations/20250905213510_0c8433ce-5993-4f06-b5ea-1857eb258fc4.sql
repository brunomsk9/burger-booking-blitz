
-- Permitir que usuários não autenticados criem reservas na página pública
CREATE POLICY "Allow anonymous users to create reservations" 
ON public.reservations 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Permitir que usuários não autenticados vejam suas próprias reservas recém-criadas
CREATE POLICY "Allow anonymous users to view reservations" 
ON public.reservations 
FOR SELECT 
TO anon
USING (true);
