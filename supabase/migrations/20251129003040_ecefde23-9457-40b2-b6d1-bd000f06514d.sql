-- REVERTER a política insegura que expõe dados sensíveis
DROP POLICY IF EXISTS "Anonymous users can view active franchises for public reservations" ON public.franchises;

-- Recriar a VIEW com security_definer para que ela execute com as permissões do criador
-- Em vez de security_invoker que executava com as permissões do usuário anônimo
DROP VIEW IF EXISTS public.franchises_public;

CREATE VIEW public.franchises_public 
WITH (security_barrier = false, security_invoker = false) AS
SELECT 
  id,
  name,
  company_name,
  slug,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  active
FROM public.franchises
WHERE active = true;

-- Com security_definer (padrão quando security_invoker = false),
-- a VIEW executa com permissões do criador (service_role)
-- permitindo acesso aos dados sem expor a tabela base

-- Garantir permissões para a VIEW
GRANT SELECT ON public.franchises_public TO anon;
GRANT SELECT ON public.franchises_public TO authenticated;
GRANT SELECT ON public.franchises_public TO service_role;