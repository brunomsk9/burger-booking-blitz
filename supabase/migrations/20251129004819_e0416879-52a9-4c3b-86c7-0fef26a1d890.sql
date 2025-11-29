-- Corrigir funções adicionando search_path para prevenir ataques de search_path injection
-- Isso corrige os avisos WARN 4-10 do security linter

-- 1. Atualizar generate_slug
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  slug_output TEXT;
BEGIN
  -- Converter para minúsculas, remover acentos e substituir espaços/caracteres especiais por hífens
  slug_output := lower(trim(text_input));
  slug_output := translate(slug_output, 
    'áàâãäåāăąèéêëēėęîïíīįìôöòóœøōõßśšûüùúūñńçćčžźż', 
    'aaaaaaaaaeeeeeeeiiiiiiooooooooossuuuuunnccczzz');
  slug_output := regexp_replace(slug_output, '[^a-z0-9]+', '-', 'g');
  slug_output := regexp_replace(slug_output, '^-+|-+$', '', 'g');
  
  RETURN slug_output;
END;
$function$;

-- 2. Atualizar handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Atualizar get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'viewer');
END;
$function$;

-- 4. Atualizar user_has_franchise_access
CREATE OR REPLACE FUNCTION public.user_has_franchise_access(franchise_name_param text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    public.get_user_role() = 'superadmin' OR
    EXISTS (
      SELECT 1 FROM public.user_franchises 
      WHERE user_id = auth.uid() AND franchise_name = franchise_name_param
    );
$function$;

-- 5. Atualizar get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(role, 'viewer') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- 6. Atualizar handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'editor'
  );
  RETURN NEW;
END;
$function$;

-- 7. Atualizar update_whatsapp_chat_metadata
CREATE OR REPLACE FUNCTION public.update_whatsapp_chat_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;