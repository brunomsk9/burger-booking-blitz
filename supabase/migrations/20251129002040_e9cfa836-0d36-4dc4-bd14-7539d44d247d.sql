-- Garantir que a VIEW franchises_public seja acessível por usuários anônimos
-- VIEWs herdam RLS da tabela base, então precisamos garantir acesso

-- Recriar a VIEW sem RLS herdada
DROP VIEW IF EXISTS public.franchises_public;

CREATE VIEW public.franchises_public 
WITH (security_barrier = false, security_invoker = true) AS
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

-- Garantir permissões para todos os roles
GRANT SELECT ON public.franchises_public TO anon;
GRANT SELECT ON public.franchises_public TO authenticated;
GRANT SELECT ON public.franchises_public TO service_role;