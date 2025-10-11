-- PARTE 1: Desabilitar RLS temporariamente para testar
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- PARTE 2: OU criar políticas mais simples (execute isto se quiser manter RLS ativo)
-- Para a tabela posts
DROP POLICY IF EXISTS "Posts são públicos para leitura" ON posts;
CREATE POLICY "Posts são públicos para leitura"
  ON posts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Usuários podem criar seus posts" ON posts;
CREATE POLICY "Usuários podem criar seus posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Para a tabela profiles
DROP POLICY IF EXISTS "Profiles são públicos" ON profiles;
CREATE POLICY "Profiles são públicos"
  ON profiles FOR SELECT
  USING (true);

-- PARTE 3: Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_posts_status
  ON posts(status);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_author_id
  ON posts(author_id);

CREATE INDEX IF NOT EXISTS idx_profiles_id
  ON profiles(id);

-- PARTE 4: Ver quais queries estão lentas (apenas para diagnóstico)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%posts%' OR query LIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 10;
