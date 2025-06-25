
-- Criar política para permitir que usuários não autenticados vejam franquias ativas
CREATE POLICY "Anyone can view active franchises" 
ON public.franchises 
FOR SELECT 
USING (active = true);
