-- Dropar a trigger e função existentes com CASCADE
DROP FUNCTION IF EXISTS public.update_whatsapp_chat_metadata() CASCADE;

-- Recriar a função com a lógica corrigida
CREATE OR REPLACE FUNCTION public.update_whatsapp_chat_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update chat metadata
  INSERT INTO public.whatsapp_chats (
    franchise_id,
    chat_id,
    customer_name,
    customer_phone,
    last_message_time,
    last_agent_message_time,
    unread_count
  )
  VALUES (
    NEW.franchise_id,
    NEW.chat_id,
    -- Só usar o customer_name se for mensagem incoming (do cliente)
    CASE WHEN NEW.direction = 'incoming' THEN NEW.customer_name ELSE NULL END,
    NEW.customer_phone,
    NEW.timestamp,
    CASE WHEN NEW.direction = 'outgoing' THEN NEW.timestamp ELSE NULL END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (franchise_id, chat_id) 
  DO UPDATE SET
    -- Só atualiza customer_name se a nova mensagem for incoming E tiver um nome
    customer_name = CASE 
      WHEN NEW.direction = 'incoming' AND NEW.customer_name IS NOT NULL 
      THEN NEW.customer_name 
      ELSE whatsapp_chats.customer_name 
    END,
    last_message_time = EXCLUDED.last_message_time,
    last_agent_message_time = CASE 
      WHEN NEW.direction = 'outgoing' THEN EXCLUDED.last_message_time 
      ELSE whatsapp_chats.last_agent_message_time 
    END,
    unread_count = CASE 
      WHEN NEW.direction = 'incoming' THEN whatsapp_chats.unread_count + 1
      ELSE 0  -- Reset unread count when agent sends message
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Recriar a trigger
CREATE TRIGGER trigger_update_chat_metadata
  AFTER INSERT ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_chat_metadata();