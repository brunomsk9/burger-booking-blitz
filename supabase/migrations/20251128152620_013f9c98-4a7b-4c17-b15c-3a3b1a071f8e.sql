-- Configurar replica identity para capturar todas as mudanças
-- Isso garante que o real-time funcione corretamente
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_chats REPLICA IDENTITY FULL;