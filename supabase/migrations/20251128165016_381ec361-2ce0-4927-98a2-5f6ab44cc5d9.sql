-- Adicionar colunas para configuração da Z-API por franquia
ALTER TABLE public.franchises 
ADD COLUMN IF NOT EXISTS zapi_instance_id TEXT,
ADD COLUMN IF NOT EXISTS zapi_token TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.franchises.zapi_instance_id IS 'Instance ID da Z-API para envio de mensagens WhatsApp';
COMMENT ON COLUMN public.franchises.zapi_token IS 'Token da Z-API para envio de mensagens WhatsApp';
COMMENT ON COLUMN public.franchises.webhook_url IS 'URL do webhook n8n para recebimento de mensagens WhatsApp';