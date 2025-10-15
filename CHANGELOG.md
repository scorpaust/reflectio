# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste ficheiro.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt/).

## [Unreleased]

### Planeado
- Sistema de cache para moderação
- Dashboard de administração
- Sistema de appeals para moderações contestadas
- Moderação de imagens com Computer Vision
- Sistema de reputação avançado
- Notificações em tempo real com WebSockets
- Aplicação mobile (React Native)
- Suporte multi-idioma (i18n)

## [0.1.0] - 2025-01-15

### Adicionado
- **Sistema de Moderação Completo**:
  - Moderação de texto em tempo real usando OpenAI Moderation API
  - Análise contextual brasileira com GPT-4o-mini
  - Moderação de áudio com transcrição automática via Whisper
  - Componentes React de moderação (`ModeratedTextInput`, `ModeratedAudioInput`)
  - Hook customizado `useModeration` para integração fácil
  - Middleware de moderação para APIs
  - Sistema de override para falsos positivos
  - Feedback visual de moderação com sugestões de melhoria
  - Documentação completa do sistema de moderação

- **Sistema de Audio-Posts**:
  - Gravação de áudio em tempo real com RecordRTC
  - Upload de ficheiros de áudio existentes
  - Player de áudio com WaveSurfer.js
  - Transcrição automática de áudio
  - Moderação automática de conteúdo transcrito
  - Storage no Supabase com políticas de segurança
  - Componentes de UI para gravação e reprodução

- **Autenticação Completa**:
  - Login com email/password
  - Registro de novos utilizadores
  - Autenticação social com Google OAuth
  - Integração com Supabase Auth
  - Sistema de avatar com upload para Supabase Storage
  - Middleware de autenticação em rotas protegidas

- **Sistema de Feed**:
  - Criação de posts de texto
  - Criação de posts de áudio
  - Visualização de feed com paginação
  - Sistema de reflexões (comentários aprofundados)
  - Modal de reflexões com moderação integrada
  - Contador de reflexões por post

- **Sistema de Perfis**:
  - Página de perfil de utilizador
  - Upload e edição de avatar
  - Visualização de estatísticas do utilizador
  - Sistema de níveis (Iniciante, Reflexivo, Pensador, Filósofo, Sábio)
  - Exibição de progresso e pontos

- **Sistema de Conexões**:
  - Lista de conexões do utilizador
  - Sistema de seguir/deixar de seguir
  - Restrições baseadas em níveis (só pode conectar com mesmo nível ou inferior)
  - Contador de conexões

- **Infraestrutura**:
  - Configuração Next.js 15 com App Router
  - Integração Supabase (Database, Auth, Storage)
  - Integração OpenAI para moderação e transcrição
  - Integração Stripe para pagamentos (preparação para premium)
  - Sistema de gestão de estado com Zustand
  - Tailwind CSS 4 para estilização
  - TypeScript estrito em todo o projeto

- **Documentação**:
  - README principal completo
  - Guia de contribuição (CONTRIBUTING.md)
  - Documentação do sistema de moderação
  - Guias de integração e exemplos de uso
  - Documentação de setup e troubleshooting
  - Changelog estruturado

### Corrigido
- **Problema crítico de RLS no Supabase**: Posts não podiam ser criados devido a políticas de Row Level Security mal configuradas
- **Performance do Supabase**: Otimização de queries para melhor performance
- **Contadores de conexões**: Fix em trigger SQL que recalcula contadores
- **Avatares do Google**: Correção no carregamento de avatares de autenticação Google
- **Políticas de storage**: Configuração correta de buckets para avatares e áudio

### Alterado
- **Limite de caracteres**: Preparação para aumentar de 200 para 2000 caracteres em posts
- **Estrutura de componentes**: Reorganização para melhor manutenibilidade
- **Sistema de tipos**: Tipos TypeScript mais rigorosos e completos

### Melhorado
- **UX de criação de posts**: Interface mais intuitiva com feedback claro
- **Sistema de moderação**: Feedback em tempo real durante digitação
- **Performance**: Debounce em moderação de texto para reduzir chamadas à API
- **Acessibilidade**: Melhores labels e navegação por teclado

### Segurança
- Moderação automática de conteúdo inadequado
- Validação de input em todos os formulários
- Sanitização de dados antes de armazenamento
- Políticas de storage seguras no Supabase
- Rate limiting preparado para implementação

## [0.0.1] - 2025-01-01

### Adicionado
- Setup inicial do projeto com Next.js
- Configuração básica do Supabase
- Estrutura de pastas e arquitetura inicial
- Configuração de TypeScript e Tailwind CSS
- Componentes básicos de UI (Button, Input, etc.)

---

## Tipos de Mudanças

- **Adicionado**: para novas funcionalidades
- **Alterado**: para mudanças em funcionalidades existentes
- **Depreciado**: para funcionalidades que serão removidas
- **Removido**: para funcionalidades removidas
- **Corrigido**: para correções de bugs
- **Segurança**: para vulnerabilidades corrigidas

## Links

- [Unreleased]: https://github.com/seu-usuario/reflectio/compare/v0.1.0...HEAD
- [0.1.0]: https://github.com/seu-usuario/reflectio/compare/v0.0.1...v0.1.0
- [0.0.1]: https://github.com/seu-usuario/reflectio/releases/tag/v0.0.1
