-- Habilita replicação completa para capturar todos os dados nas mudanças
ALTER TABLE public.reservations REPLICA IDENTITY FULL;

-- Adiciona a tabela à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;