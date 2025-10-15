-- Script para corrigir avatares do Google em perfis existentes
-- Execute no SQL Editor do Supabase

-- Verificar usuários com dados do Google mas sem avatar no perfil
SELECT 
    p.id,
    p.full_name,
    p.avatar_url as current_avatar,
    u.raw_user_meta_data->>'avatar_url' as google_avatar
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.avatar_url IS NULL 
AND u.raw_user_meta_data->>'avatar_url' IS NOT NULL;

-- Atualizar avatares em falta
UPDATE profiles 
SET avatar_url = (
    SELECT auth.users.raw_user_meta_data->>'avatar_url'
    FROM auth.users 
    WHERE auth.users.id = profiles.id
)
WHERE avatar_url IS NULL
AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id 
    AND auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL
);

-- Verificar resultados
SELECT 
    p.id,
    p.full_name,
    p.avatar_url
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.raw_user_meta_data->>'avatar_url' IS NOT NULL;