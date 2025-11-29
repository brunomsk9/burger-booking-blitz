-- Remove a política de leitura anônima da tabela principal
DROP POLICY IF EXISTS "Anonymous users can view active franchises" ON public.franchises;

-- Cria uma VIEW pública com apenas informações não-sensíveis
CREATE OR REPLACE VIEW public.franchises_public AS
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

-- Permite leitura anônima apenas da VIEW
GRANT SELECT ON public.franchises_public TO anon;
GRANT SELECT ON public.franchises_public TO authenticated;