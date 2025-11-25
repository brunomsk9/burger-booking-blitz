-- Adicionar campo slug na tabela franchises
ALTER TABLE franchises 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Criar índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_franchises_slug ON franchises(slug);

-- Função para gerar slug a partir do nome da empresa
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug_output TEXT;
BEGIN
  -- Converter para minúsculas, remover acentos e substituir espaços/caracteres especiais por hífens
  slug_output := lower(trim(text_input));
  slug_output := translate(slug_output, 
    'áàâãäåāăąèéêëēėęîïíīįìôöòóœøōõßśšûüùúūñńçćčžźż', 
    'aaaaaaaaaeeeeeeeiiiiiiooooooooossuuuuunnccczzz');
  slug_output := regexp_replace(slug_output, '[^a-z0-9]+', '-', 'g');
  slug_output := regexp_replace(slug_output, '^-+|-+$', '', 'g');
  
  RETURN slug_output;
END;
$$;

-- Gerar slugs para franquias existentes (usando company_name ou name)
UPDATE franchises 
SET slug = generate_slug(COALESCE(company_name, name))
WHERE slug IS NULL;

-- Adicionar constraint para garantir que slug não seja vazio
ALTER TABLE franchises 
ADD CONSTRAINT franchises_slug_not_empty 
CHECK (slug IS NOT NULL AND length(trim(slug)) > 0);
