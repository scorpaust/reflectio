# 🔧 Como Consertar a Criação de Posts

## ⚠️ PROBLEMA
A criação de posts trava infinitamente porque o Supabase Row Level Security (RLS) está bloqueando os INSERTs.

## ✅ SOLUÇÃO - Passo a Passo

### Passo 1: Acesse o Supabase Dashboard
1. Abra o navegador
2. Vá para: https://supabase.com/dashboard/project/taewcmmzroxtkuaenirk
3. Faça login se necessário

### Passo 2: Abrir SQL Editor
1. No menu lateral **esquerdo**, procure por "SQL Editor"
2. Clique em "SQL Editor"
3. Clique no botão verde "+ New query"

### Passo 3: Executar o SQL
1. Cole este código exatamente como está:

```sql
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

2. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
3. Deve aparecer "Success. No rows returned"

### Passo 4: Testar
1. Volte para http://localhost:3001/feed
2. **RECARREGUE A PÁGINA** (F5)
3. Tente criar um post
4. Deve funcionar instantaneamente agora!

---

## 🤔 Se Ainda Não Funcionar

Execute ESTE SQL em vez do anterior:

```sql
-- Ver estado atual do RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'posts';

-- Remover TODAS as políticas
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view their own drafts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Desabilitar RLS completamente
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

---

## 📝 Depois que Funcionar

Depois de confirmar que posts são criados com sucesso, vamos reativar o RLS com políticas corretas:

```sql
-- Reativar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política permissiva para INSERT
CREATE POLICY "allow_insert_posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para SELECT
CREATE POLICY "allow_select_published_posts"
ON posts FOR SELECT
TO authenticated
USING (status = 'published' OR author_id = auth.uid());

-- Política para UPDATE (apenas próprios posts)
CREATE POLICY "allow_update_own_posts"
ON posts FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

-- Política para DELETE (apenas próprios posts)
CREATE POLICY "allow_delete_own_posts"
ON posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

---

## ❓ Perguntas Frequentes

### Por que isso acontece?
O RLS está verificando se `auth.uid() = author_id` mas isso está causando um deadlock ou timeout no servidor.

### É seguro desabilitar RLS?
Temporariamente sim, apenas para testar. Depois vamos reativar com políticas corretas.

### E se eu não conseguir acessar o Dashboard?
Verifique se você tem as credenciais corretas e se o projeto está ativo.

---

## 📞 Me avise quando:
1. Executar o SQL
2. Aparecer "Success" ou erro
3. Testar criar o post
4. Funcionar ou continuar travando

Vou estar aqui para ajudar!
