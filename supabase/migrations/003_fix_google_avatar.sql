-- Atualizar função para capturar avatar do Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar perfis existentes que não têm avatar mas têm dados do Google
UPDATE profiles 
SET avatar_url = (
    SELECT auth.users.raw_user_meta_data->>'avatar_url'
    FROM auth.users 
    WHERE auth.users.id = profiles.id
    AND auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL
)
WHERE avatar_url IS NULL
AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id 
    AND auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL
);