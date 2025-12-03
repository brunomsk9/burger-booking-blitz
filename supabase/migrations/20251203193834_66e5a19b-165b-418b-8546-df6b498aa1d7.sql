-- Adicionar coluna last_message_text na tabela whatsapp_chats
ALTER TABLE public.whatsapp_chats
ADD COLUMN last_message_text text;

-- Atualizar o trigger para salvar o texto da última mensagem
CREATE OR REPLACE FUNCTION public.update_whatsapp_chat_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert or update chat metadata
  INSERT INTO public.whatsapp_chats (
    franchise_id,
    chat_id,
    customer_name,
    customer_phone,
    last_message_time,
    last_agent_message_time,
    unread_count,
    last_message_text
  )
  VALUES (
    NEW.franchise_id,
    NEW.chat_id,
    CASE WHEN NEW.direction = 'incoming' THEN NEW.customer_name ELSE NULL END,
    NEW.customer_phone,
    NEW.timestamp,
    CASE WHEN NEW.direction = 'outgoing' THEN NEW.timestamp ELSE NULL END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END,
    NEW.message_text
  )
  ON CONFLICT (franchise_id, chat_id) 
  DO UPDATE SET
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
      ELSE 0
    END,
    last_message_text = EXCLUDED.last_message_text,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- Preencher dados existentes com a última mensagem de cada chat
UPDATE public.whatsapp_chats c
SET last_message_text = (
  SELECT m.message_text
  FROM public.whatsapp_messages m
  WHERE m.franchise_id = c.franchise_id AND m.chat_id = c.chat_id
  ORDER BY m.timestamp DESC
  LIMIT 1
);