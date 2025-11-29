-- Adicionar coluna de tags aos chats do WhatsApp
ALTER TABLE whatsapp_chats 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Criar índice para melhor performance nas buscas por tags
CREATE INDEX idx_whatsapp_chats_tags ON whatsapp_chats USING GIN(tags);

-- Criar índice para melhor performance nas mensagens
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_franchise_timestamp 
ON whatsapp_messages(franchise_id, timestamp DESC);

-- Criar índice para melhor performance nos chats
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_franchise_last_message 
ON whatsapp_chats(franchise_id, last_message_time DESC NULLS LAST);

-- Comentário sobre as tags predefinidas disponíveis
COMMENT ON COLUMN whatsapp_chats.tags IS 'Tags predefinidas: urgente, resolvido, aguardando_cliente, aguardando_interno, importante, follow_up, cancelado, vip';