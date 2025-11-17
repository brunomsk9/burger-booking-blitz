-- Remove políticas permissivas que permitem ver todas as franquias
DROP POLICY IF EXISTS "Anyone can view active franchises" ON public.franchises;
DROP POLICY IF EXISTS "Users can view franchises" ON public.franchises;
DROP POLICY IF EXISTS "View franchises" ON public.franchises;

-- Mantém apenas a política restritiva que verifica o papel e as franquias vinculadas
-- Esta política já existe e está correta:
-- "Admin and superadmin can view franchises" 
-- ((get_user_role() = 'superadmin'::text) OR ((get_user_role() = 'admin'::text) AND (id IN ( SELECT uf.franchise_id FROM user_franchises uf WHERE (uf.user_id = auth.uid())))))

-- Adiciona política para usuários não autenticados verem apenas franquias ativas
-- (necessário para página pública de reservas)
CREATE POLICY "Anonymous users can view active franchises" 
ON public.franchises 
FOR SELECT 
TO anon
USING (active = true);