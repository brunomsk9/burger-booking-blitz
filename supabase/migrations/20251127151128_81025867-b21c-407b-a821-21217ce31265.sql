-- Criar política para permitir que editores vejam suas franquias
CREATE POLICY "Editors can view their assigned franchises"
ON public.franchises
FOR SELECT
TO authenticated
USING (
  get_user_role() = 'editor' 
  AND active = true
  AND id IN (
    SELECT franchise_id 
    FROM public.user_franchises 
    WHERE user_id = auth.uid()
  )
);