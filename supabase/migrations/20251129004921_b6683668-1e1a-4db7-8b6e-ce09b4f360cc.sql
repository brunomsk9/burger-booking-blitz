-- Adicionar políticas RLS para as tabelas antigas do WhatsApp
-- Isso corrige os avisos INFO 1 e INFO 2 do security linter

-- Políticas para [whatsapp][cadastro_de_clientes]
CREATE POLICY "Only superadmin can view legacy whatsapp customer data"
ON "[whatsapp][cadastro_de_clientes]"
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can insert legacy whatsapp customer data"
ON "[whatsapp][cadastro_de_clientes]"
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can update legacy whatsapp customer data"
ON "[whatsapp][cadastro_de_clientes]"
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'superadmin')
WITH CHECK (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can delete legacy whatsapp customer data"
ON "[whatsapp][cadastro_de_clientes]"
FOR DELETE
TO authenticated
USING (public.get_user_role() = 'superadmin');

-- Políticas para [whatsapp][mensagens_temporarias]
CREATE POLICY "Only superadmin can view legacy whatsapp messages"
ON "[whatsapp][mensagens_temporarias]"
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can insert legacy whatsapp messages"
ON "[whatsapp][mensagens_temporarias]"
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can update legacy whatsapp messages"
ON "[whatsapp][mensagens_temporarias]"
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'superadmin')
WITH CHECK (public.get_user_role() = 'superadmin');

CREATE POLICY "Only superadmin can delete legacy whatsapp messages"
ON "[whatsapp][mensagens_temporarias]"
FOR DELETE
TO authenticated
USING (public.get_user_role() = 'superadmin');