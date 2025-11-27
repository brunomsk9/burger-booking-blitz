-- Add read status to messages
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

-- Create whatsapp_chats table to track conversation metadata
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE CASCADE NOT NULL,
  chat_id text NOT NULL,
  customer_name text,
  customer_phone text NOT NULL,
  archived boolean DEFAULT false,
  last_message_time timestamp with time zone,
  last_agent_message_time timestamp with time zone,
  unread_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(franchise_id, chat_id)
);

-- Create index for faster queries
CREATE INDEX idx_whatsapp_chats_franchise_id ON public.whatsapp_chats(franchise_id);
CREATE INDEX idx_whatsapp_chats_archived ON public.whatsapp_chats(archived);
CREATE INDEX idx_whatsapp_chats_last_message ON public.whatsapp_chats(last_message_time DESC);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view chats from their franchises
CREATE POLICY "Users can view chats from their franchises"
ON public.whatsapp_chats
FOR SELECT
USING (
  (get_user_role() = 'superadmin'::text) OR
  (franchise_id IN (
    SELECT franchise_id FROM public.user_franchises 
    WHERE user_id = auth.uid()
  ))
);

-- Policy: Users can update chats for their franchises
CREATE POLICY "Users can update chats for their franchises"
ON public.whatsapp_chats
FOR UPDATE
USING (
  (get_user_role() = 'superadmin'::text) OR
  (franchise_id IN (
    SELECT franchise_id FROM public.user_franchises 
    WHERE user_id = auth.uid()
  ))
);

-- Policy: System can insert chats
CREATE POLICY "Users can create chats for their franchises"
ON public.whatsapp_chats
FOR INSERT
WITH CHECK (
  (get_user_role() = 'superadmin'::text) OR
  (franchise_id IN (
    SELECT franchise_id FROM public.user_franchises 
    WHERE user_id = auth.uid()
  ))
);

-- Enable realtime for whatsapp_chats
ALTER TABLE public.whatsapp_chats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;

-- Function to update or create chat metadata
CREATE OR REPLACE FUNCTION update_whatsapp_chat_metadata()
RETURNS TRIGGER AS $$
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
    NEW.customer_name,
    NEW.customer_phone,
    NEW.timestamp,
    CASE WHEN NEW.direction = 'outgoing' THEN NEW.timestamp ELSE NULL END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (franchise_id, chat_id) 
  DO UPDATE SET
    customer_name = COALESCE(EXCLUDED.customer_name, whatsapp_chats.customer_name),
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
$$ LANGUAGE plpgsql;

-- Create trigger to update chat metadata
DROP TRIGGER IF EXISTS trigger_update_chat_metadata ON public.whatsapp_messages;
CREATE TRIGGER trigger_update_chat_metadata
AFTER INSERT ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_chat_metadata();