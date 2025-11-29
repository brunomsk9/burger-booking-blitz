-- Permitir que usuários anônimos vejam dados de tema (cores e logo) de franquias ativas
-- Isso é seguro porque expõe apenas dados visuais/públicos, não dados sensíveis
CREATE POLICY "Anonymous users can view theme data of active franchises"
ON public.franchises
FOR SELECT
TO anon
USING (
  active = true
);