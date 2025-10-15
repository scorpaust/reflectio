-- Script para recalcular todos os contadores manualmente
-- Execute este script no SQL Editor do Supabase se os contadores estiverem incorretos

-- Recalcular total_posts
UPDATE profiles SET total_posts = (
    SELECT COUNT(*) 
    FROM posts 
    WHERE posts.author_id = profiles.id 
    AND posts.status = 'published'
);

-- Recalcular total_reflections  
UPDATE profiles SET total_reflections = (
    SELECT COUNT(*) 
    FROM reflections 
    WHERE reflections.author_id = profiles.id
);

-- Recalcular total_connections
UPDATE profiles SET total_connections = (
    SELECT COUNT(*) 
    FROM connections 
    WHERE (connections.requester_id = profiles.id OR connections.addressee_id = profiles.id)
    AND connections.status = 'accepted'
);

-- Garantir que não há valores NULL
UPDATE profiles SET 
    total_posts = COALESCE(total_posts, 0),
    total_reflections = COALESCE(total_reflections, 0),
    total_connections = COALESCE(total_connections, 0),
    quality_score = COALESCE(quality_score, 0),
    current_level = COALESCE(current_level, 1);

-- Verificar os resultados
SELECT 
    full_name,
    total_posts,
    total_reflections,
    total_connections,
    current_level
FROM profiles 
ORDER BY total_posts DESC, total_reflections DESC;