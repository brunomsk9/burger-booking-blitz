-- Corrigir reservas antigas que foram salvas com horário local como se fosse UTC
-- Ajuste: somar 3 horas (America/Sao_Paulo) para que o UTC no banco represente corretamente o horário local

UPDATE public.reservations
SET date_time = date_time + INTERVAL '3 hours',
    updated_at = now()
WHERE created_at < TIMESTAMPTZ '2025-12-19T00:00:00Z';