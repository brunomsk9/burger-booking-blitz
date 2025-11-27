-- Remover políticas duplicadas e conflitantes de user_franchises
DROP POLICY IF EXISTS "Manage user franchises" ON user_franchises;
DROP POLICY IF EXISTS "View user franchises" ON user_franchises;
DROP POLICY IF EXISTS "user_franchises_all" ON user_franchises;
DROP POLICY IF EXISTS "user_franchises_select" ON user_franchises;

-- Criar políticas limpas e funcionais
-- Usuários podem ver suas próprias associações de franquia
CREATE POLICY "Users can view their own franchises"
ON user_franchises
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR get_user_role() = 'superadmin');

-- Apenas superadmin pode gerenciar associações de franquia
CREATE POLICY "Superadmin can manage user franchises"
ON user_franchises
FOR ALL
TO authenticated
USING (get_user_role() = 'superadmin')
WITH CHECK (get_user_role() = 'superadmin');