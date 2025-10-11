# Fix para Feed Lento/Não Carregar

## Problema
O feed não carrega porque a tabela `profiles` precisa ter Row Level Security (RLS) configurado para que o JOIN com `posts` funcione corretamente.

## Solução

### Opção 1: Executar SQL no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá para seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Execute o seguinte SQL:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view profiles (needed for joins)
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Opção 2: Aplicar Migration (se tiver Supabase CLI)

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Verificação

Após aplicar as políticas:

1. Recarregue a página do feed
2. Abra o Console do navegador (F12)
3. Procure pelos logs:
   - `🔍 Starting fetchPosts...`
   - `🔐 Session: authenticated`
   - `✅ Posts fetched successfully: X`

Se ver erros, compartilhe os logs para diagnóstico.

## Debug Adicional

Se ainda não funcionar, verifique:

1. **Autenticação**: Certifique-se que está logado
2. **Posts existem**: Verifique no Supabase Dashboard > Table Editor > posts
3. **Profiles existem**: Verifique no Supabase Dashboard > Table Editor > profiles
4. **RLS habilitado**: Vá em Table Editor > posts/profiles > Settings > verifique "Row Level Security"
