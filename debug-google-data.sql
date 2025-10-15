-- Script para debugar dados do Google
-- Execute no SQL Editor do Supabase

-- Verificar dados dos usuários autenticados via Google
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data,
    u.raw_user_meta_data->>'avatar_url' as google_avatar_url,
    u.raw_user_meta_data->>'picture' as google_picture,
    u.raw_user_meta_data->>'full_name' as google_name,
    p.full_name as profile_name,
    p.avatar_url as profile_avatar
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.raw_user_meta_data IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 10;