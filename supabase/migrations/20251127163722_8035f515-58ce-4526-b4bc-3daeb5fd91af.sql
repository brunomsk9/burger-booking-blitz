-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE CASCADE NOT NULL,
  chat_id text NOT NULL,
  customer_name text,
  customer_phone text NOT NULL,
  message_text text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  message_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_whatsapp_messages_franchise_id ON public.whatsapp_messages(franchise_id);
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages from their franchises
CREATE POLICY "Users can view messages from their franchises"
ON public.whatsapp_messages
FOR SELECT
USING (
  (get_user_role() = 'superadmin'::text) OR
  (franchise_id IN (
    SELECT franchise_id FROM public.user_franchises 
    WHERE user_id = auth.uid()
  ))
);

-- Policy: Users can create messages for their franchises
CREATE POLICY "Users can create messages for their franchises"
ON public.whatsapp_messages
FOR INSERT
WITH CHECK (
  (get_user_role() = 'superadmin'::text) OR
  (franchise_id IN (
    SELECT franchise_id FROM public.user_franchises 
    WHERE user_id = auth.uid()
  ))
);

-- Enable realtime for whatsapp_messages
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;