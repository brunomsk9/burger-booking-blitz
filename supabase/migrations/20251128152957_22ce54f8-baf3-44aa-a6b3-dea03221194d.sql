-- Criar tabela para respostas rápidas
CREATE TABLE IF NOT EXISTS public.whatsapp_quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  shortcut TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view quick replies from their franchises"
  ON public.whatsapp_quick_replies
  FOR SELECT
  USING (
    (get_user_role() = 'superadmin') OR
    (franchise_id IN (
      SELECT franchise_id FROM user_franchises WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create quick replies for their franchises"
  ON public.whatsapp_quick_replies
  FOR INSERT
  WITH CHECK (
    (get_user_role() = 'superadmin') OR
    (franchise_id IN (
      SELECT franchise_id FROM user_franchises WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update quick replies from their franchises"
  ON public.whatsapp_quick_replies
  FOR UPDATE
  USING (
    (get_user_role() = 'superadmin') OR
    (franchise_id IN (
      SELECT franchise_id FROM user_franchises WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete quick replies from their franchises"
  ON public.whatsapp_quick_replies
  FOR DELETE
  USING (
    (get_user_role() = 'superadmin') OR
    (franchise_id IN (
      SELECT franchise_id FROM user_franchises WHERE user_id = auth.uid()
    ))
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_quick_replies_updated_at
  BEFORE UPDATE ON public.whatsapp_quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Índice para melhorar performance
CREATE INDEX idx_whatsapp_quick_replies_franchise_id 
  ON public.whatsapp_quick_replies(franchise_id);