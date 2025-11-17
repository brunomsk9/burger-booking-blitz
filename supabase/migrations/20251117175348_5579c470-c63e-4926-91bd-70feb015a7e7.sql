-- Remover a constraint antiga de status
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Adicionar nova constraint com os status atualizados
-- pending, approved, confirmed, cancelled
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'approved', 'confirmed', 'cancelled'));

-- Atualizar status existentes de 'confirmed' para 'approved'
UPDATE reservations SET status = 'approved' WHERE status = 'confirmed';