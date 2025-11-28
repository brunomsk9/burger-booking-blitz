-- Adicionar coluna para Client-Token da Z-API
ALTER TABLE public.franchises 
ADD COLUMN IF NOT EXISTS zapi_client_token TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.franchises.zapi_client_token IS 'Client-Token da Z-API para autenticação das requisições';