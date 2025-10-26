-- Tabela para armazenar mensagens de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  attachment_name TEXT,
  attachment_size INTEGER,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- RLS (Row Level Security) - apenas admins podem ver mensagens
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de qualquer utilizador autenticado
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Política para apenas admins lerem (por agora, nenhum utilizador pode ler)
-- Quando implementarmos sistema de admin, podemos ajustar esta política
CREATE POLICY "Only admins can read contact messages" ON contact_messages
  FOR SELECT USING (false);

-- Comentários para documentação
COMMENT ON TABLE contact_messages IS 'Armazena mensagens de contacto enviadas através do formulário';
COMMENT ON COLUMN contact_messages.status IS 'Status da mensagem: new, read, replied, closed';
COMMENT ON COLUMN contact_messages.attachment_name IS 'Nome do ficheiro anexado (se houver)';
COMMENT ON COLUMN contact_messages.attachment_size IS 'Tamanho do ficheiro anexado em bytes';