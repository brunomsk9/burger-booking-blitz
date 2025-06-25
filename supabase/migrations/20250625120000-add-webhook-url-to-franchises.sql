
-- Adicionar campo webhook_url à tabela franchises
ALTER TABLE public.franchises 
ADD COLUMN webhook_url TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.franchises.webhook_url IS 'URL do webhook para notificações de reservas da franquia';
