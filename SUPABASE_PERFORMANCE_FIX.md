# Como resolver os problemas de performance do Supabase

## Problema
As queries do Supabase estão demorando mais de 5-10 segundos para retornar, causando:
- Feed não carrega
- Posts não são publicados
- Sessão demora muito para autenticar

## Causa provável
Row Level Security (RLS) muito complexo ou índices faltando.

## Solução

### 1. Simplificar as políticas RLS

Execute no **SQL Editor** do Supabase Dashboard:

```sql
-- Desabilitar RLS temporariamente para testar
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- OU criar políticas mais simples
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
```

### 2. Adicionar índices

```sql
-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_posts_status
  ON posts(status);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_author_id
  ON posts(author_id);

CREATE INDEX IF NOT EXISTS idx_profiles_id
  ON profiles(id);
```

### 3. Verificar a região do Supabase

1. Vá em **Project Settings** → **General**
2. Verifique se a região está próxima de você
3. Se não estiver, considere migrar o projeto para uma região mais próxima

### 4. Habilitar pool de conexões

1. Vá em **Project Settings** → **Database**
2. Habilite **Connection Pooling**
3. Use a connection string com pooling

## Teste após cada mudança

Após executar cada SQL:
1. Recarregue a página do feed
2. Tente criar um novo post
3. Verifique se o tempo de resposta melhorou

## Se ainda estiver lento

Execute este comando para ver quais queries estão lentas:

```sql
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%posts%' OR query LIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

Isso vai mostrar quais queries precisam de otimização.
