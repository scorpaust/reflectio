-- Script para corrigir apenas o contador de conexões
-- Execute no SQL Editor do Supabase

UPDATE profiles SET total_connections = (
    SELECT COUNT(*) 
    FROM connections 
    WHERE (connections.requester_id = profiles.id OR connections.addressee_id = profiles.id)
    AND connections.status = 'accepted'
);

-- Verificar os resultados
SELECT 
    full_name,
    total_connections,
    (SELECT COUNT(*) FROM connections WHERE (requester_id = profiles.id OR addressee_id = profiles.id) AND status = 'accepted') as real_connections
FROM profiles 
WHERE total_connections > 0 OR (SELECT COUNT(*) FROM connections WHERE (requester_id = profiles.id OR addressee_id = profiles.id) AND status = 'accepted') > 0;