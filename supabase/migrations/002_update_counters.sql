-- Função para atualizar contadores de posts
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador de posts do autor
        UPDATE profiles 
        SET total_posts = COALESCE(total_posts, 0) + 1
        WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador de posts do autor
        UPDATE profiles 
        SET total_posts = GREATEST(COALESCE(total_posts, 0) - 1, 0)
        WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contadores de reflexões
CREATE OR REPLACE FUNCTION update_reflection_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador de reflexões do autor
        UPDATE profiles 
        SET total_reflections = COALESCE(total_reflections, 0) + 1
        WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador de reflexões do autor
        UPDATE profiles 
        SET total_reflections = GREATEST(COALESCE(total_reflections, 0) - 1, 0)
        WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para posts
DROP TRIGGER IF EXISTS trigger_update_post_counters ON posts;
CREATE TRIGGER trigger_update_post_counters
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- Criar triggers para reflexões
DROP TRIGGER IF EXISTS trigger_update_reflection_counters ON reflections;
CREATE TRIGGER trigger_update_reflection_counters
    AFTER INSERT OR DELETE ON reflections
    FOR EACH ROW EXECUTE FUNCTION update_reflection_counters();

-- Atualizar contadores existentes (recalcular tudo)
UPDATE profiles SET 
    total_posts = (
        SELECT COUNT(*) 
        FROM posts 
        WHERE posts.author_id = profiles.id 
        AND posts.status = 'published'
    ),
    total_reflections = (
        SELECT COUNT(*) 
        FROM reflections 
        WHERE reflections.author_id = profiles.id
    );

-- Garantir que não há valores NULL
UPDATE profiles SET 
    total_posts = COALESCE(total_posts, 0),
    total_reflections = COALESCE(total_reflections, 0),
    total_connections = COALESCE(total_connections, 0),
    quality_score = COALESCE(quality_score, 0),
    current_level = COALESCE(current_level, 1);