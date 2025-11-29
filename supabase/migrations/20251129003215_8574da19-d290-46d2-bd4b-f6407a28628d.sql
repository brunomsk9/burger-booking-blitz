-- Recriar a VIEW franchises_public com apenas id e name
DROP VIEW IF EXISTS public.franchises_public;

CREATE VIEW public.franchises_public 
WITH (security_barrier = false, security_invoker = false) AS
SELECT 
  id,
  name
FROM public.franchises
WHERE active = true;

-- Garantir permissões para a VIEW
GRANT SELECT ON public.franchises_public TO anon;
GRANT SELECT ON public.franchises_public TO authenticated;
GRANT SELECT ON public.franchises_public TO service_role;