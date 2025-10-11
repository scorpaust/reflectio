# 🚨 PROBLEMA CRÍTICO - POSTS NÃO FUNCIONAM

## O Problema

**NENHUM post pode ser criado** porque o Supabase Row Level Security (RLS) está bloqueando todos os INSERTs na tabela `posts`.

## A Única Solução

**Você PRECISA executar SQL no Supabase Dashboard**. Não há outra forma.

---

## 📋 PASSO A PASSO (5 MINUTOS)

### 1. Abra o Link Direto
**Cole este link no navegador:**
```
https://supabase.com/dashboard/project/taewcmmzroxtkuaenirk/sql/new
```

### 2. Cole o SQL
```sql
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

### 3. Clique em "RUN" (botão verde no canto inferior direito)

### 4. Deve aparecer "Success. No rows returned"

### 5. Volte para http://localhost:3001/feed e tente criar um post

---

## ✅ Depois de Funcionar

Quando posts forem criados com sucesso, me avise que eu:
- Removo o limite de 200 caracteres
- Coloco limite de 2000 caracteres
- Reativo RLS com políticas corretas

---

## ❓ Por que isso aconteceu?

O RLS está verificando permissões de forma que causa timeout. As políticas atuais estão mal configuradas.

## 🔒 É Seguro Desabilitar RLS?

Temporariamente sim, para desenvolvimento local. Depois reativamos com políticas corretas.

---

## 📞 Próximos Passos

1. Execute o SQL acima
2. Me confirme que funcionou
3. Eu ajusto o código para 2000 caracteres
4. Reativamos RLS com políticas corretas

**SEM EXECUTAR O SQL, NADA VAI FUNCIONAR.**
