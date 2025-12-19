-- Reverter a adição de 3 horas feita incorretamente
-- Subtrair 3 horas para voltar ao valor original

UPDATE public.reservations
SET date_time = date_time - INTERVAL '3 hours',
    updated_at = now()
WHERE created_at < TIMESTAMPTZ '2025-12-19T00:00:00Z';