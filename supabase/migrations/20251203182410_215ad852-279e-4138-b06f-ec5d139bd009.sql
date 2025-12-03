-- Criar índices para otimizar as queries do WhatsApp
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_franchise_chat_timestamp 
ON whatsapp_messages(franchise_id, chat_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_franchise_timestamp 
ON whatsapp_messages(franchise_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_franchise_last_message 
ON whatsapp_chats(franchise_id, last_message_time DESC);