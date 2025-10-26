-- Remover a política existente que pode estar a causar problemas
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;

-- Criar nova política que permite inserção anónima
CREATE POLICY "Allow anonymous contact form submissions" ON contact_messages
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Verificar se a tabela tem RLS habilitado
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política para leitura (apenas para admins futuramente)
DROP POLICY IF EXISTS "Only admins can read contact messages" ON contact_messages;
CREATE POLICY "No public read access to contact messages" ON contact_messages
  FOR SELECT 
  USING (false);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'contact_messages' 
ORDER BY ordinal_position;