# Implementation Plan - Correção de Permissões de Utilizadores

## Task List

- [x] 1. Criar sistema base de permissões

  - Implementar serviço centralizado de permissões que determina capacidades do utilizador
  - Criar interfaces TypeScript para definir tipos de permissões
  - Implementar lógica para detectar status premium ativo vs expirado
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 1.1 Implementar PermissionService

  - Criar `lib/services/permissions.ts` com lógica de verificação de permissões
  - Implementar método `getUserPermissions()` que retorna capacidades do utilizador
  - Adicionar verificação de status premium baseado em `is_premium` e `premium_expires_at`
  - _Requirements: 1.1, 2.1_

- [ ] 1.2 Estender UserContext com permissões

  - Modificar `lib/contexts/UserContext.tsx` para incluir estado de permissões
  - Adicionar campo `permissions` e `isPremium` ao contexto
  - Implementar hook `usePermissions()` para acesso fácil às permissões
  - _Requirements: 1.1, 2.1_

- [x] 1.3 Criar testes unitários para PermissionService

  - Testar detecção de status premium
  - Testar cálculo de permissões para utilizadores gratuitos vs premium
  - Testar casos edge como premium expirado
  - _Requirements: 1.1, 2.1_

- [x] 2. Implementar controle de acesso a conteúdo premium

  - Filtrar posts premium para utilizadores gratuitos
  - Implementar verificação de acesso a posts individuais
  - Adicionar lógica para mostrar previews limitados de conteúdo premium
  - _Requirements: 1.1, 2.1_

- [x] 2.1 Criar PostFilterService

  - Implementar `lib/services/postFiltering.ts` para filtrar posts baseado em permissões
  - Criar método `filterPostsForUser()` que remove posts premium para utilizadores gratuitos
  - Implementar query otimizada que filtra a nível de base de dados
  - _Requirements: 1.1, 2.1_

- [ ] 2.2 Atualizar componentes de listagem de posts

  - Modificar componentes que mostram listas de posts para usar filtro de permissões
  - Atualizar `components/feed/PostCard.tsx` para mostrar indicadores de conteúdo premium
  - Adicionar mensagens de upgrade quando utilizador gratuito vê conteúdo restrito
  - _Requirements: 1.1, 5.1, 5.2_

- [x] 2.3 Implementar verificação de acesso individual a posts

  - Criar middleware para APIs de posts que verifica permissões
  - Implementar verificação server-side em `/api/posts/[id]`
  - Retornar erro 403 com mensagem de upgrade para conteúdo premium
  - _Requirements: 1.1, 2.1, 5.3_

- [x] 2.4 Criar testes para filtragem de posts

  - Testar filtragem de posts premium para utilizadores gratuitos
  - Testar acesso completo para utilizadores premium
  - Testar respostas de erro para acesso negado
  - _Requirements: 1.1, 2.1_

- [x] 3. Implementar restrições de reflexões

  - Permitir reflexões apenas em posts públicos de utilizadores gratuitos para utilizadores gratuitos
  - Permitir reflexões em qualquer post para utilizadores premium
  - Adicionar verificações server-side e client-side
  - _Requirements: 1.2, 2.2_

- [x] 3.1 Criar ReflectionPermissionChecker

  - Implementar `lib/services/reflectionPermissions.ts`
  - Criar método `canCreateReflection()` que verifica se utilizador pode criar reflexão em post específico
  - Implementar lógica: gratuito só pode refletir em posts públicos de outros gratuitos
  - _Requirements: 1.2, 2.2_

- [x] 3.2 Atualizar componente de criação de reflexões

  - Modificar `components/feed/ReflectionModal.tsx` para verificar permissões antes de mostrar
  - Adicionar mensagem explicativa quando reflexão não é permitida
  - Implementar botão de upgrade quando ação é restrita
  - _Requirements: 1.2, 5.1, 5.3_

- [x] 3.3 Implementar validação server-side para reflexões

  - Adicionar verificação de permissões em API de criação de reflexões
  - Implementar middleware que valida se utilizador pode criar reflexão no post
  - Retornar erro específico com razão da restrição
  - _Requirements: 1.2, 2.2_

- [x] 3.4 Criar testes para permissões de reflexões

  - Testar criação de reflexões por utilizadores gratuitos em posts públicos
  - Testar bloqueio de reflexões em posts premium para utilizadores gratuitos
  - Testar acesso completo para utilizadores premium
  - _Requirements: 1.2, 2.2_

- [x] 4. Implementar restrições de conexões

  - Permitir apenas aceitar/recusar conexões para utilizadores gratuitos
  - Permitir solicitar conexões para utilizadores premium
  - Atualizar UI para refletir capacidades do utilizador
  - _Requirements: 1.4, 2.4_

- [x] 4.1 Criar ConnectionPermissionManager

  - Implementar `lib/services/connectionPermissions.ts`
  - Criar métodos `canRequestConnection()` e `canRespondToConnection()`
  - Implementar lógica: gratuitos só podem responder, premium podem solicitar
  - _Requirements: 1.4, 2.4_

- [x] 4.2 Atualizar componentes de conexões

  - Modificar componentes de conexões para mostrar apenas ações permitidas
  - Esconder botão "Solicitar Conexão" para utilizadores gratuitos
  - Adicionar mensagem explicativa e botão de upgrade
  - _Requirements: 1.4, 5.1, 5.3_

- [x] 4.3 Implementar validação server-side para conexões

  - Adicionar verificação de permissões em API de conexões
  - Bloquear criação de pedidos de conexão por utilizadores gratuitos
  - Permitir apenas respostas (aceitar/recusar) para utilizadores gratuitos
  - _Requirements: 1.4, 2.4_

- [x] 4.4 Criar testes para permissões de conexões

  - Testar bloqueio de solicitações para utilizadores gratuitos
  - Testar permissão de respostas para utilizadores gratuitos
  - Testar acesso completo para utilizadores premium
  - _Requirements: 1.4, 2.4_

- [x] 5. Implementar moderação inteligente

  - Aplicar moderação obrigatória para utilizadores gratuitos
  - Aplicar moderação inteligente (quando necessário) para utilizadores premium
  - Manter logs de moderação para análise
  - _Requirements: 2.5, 3.1, 3.2_

- [x] 5.1 Atualizar sistema de moderação

  - Modificar `lib/utils/moderation.ts` para considerar status premium
  - Implementar lógica de moderação condicional baseada em tipo de utilizador
  - Manter moderação obrigatória para utilizadores gratuitos
  - _Requirements: 2.5, 3.1, 3.2_

- [x] 5.2 Atualizar APIs de moderação

  - Modificar `app/api/moderation/text/route.ts` para aplicar regras baseadas em utilizador
  - Modificar `app/api/moderation/audio/route.ts` com mesma lógica
  - Implementar bypass inteligente para utilizadores premium confiáveis
  - _Requirements: 2.5, 3.1, 3.2_

- [x] 5.3 Criar testes para moderação inteligente

  - Testar moderação obrigatória para utilizadores gratuitos
  - Testar moderação condicional para utilizadores premium
  - Testar logs e métricas de moderação
  - _Requirements: 2.5, 3.1, 3.2_

- [ ] 6. Implementar mensagens de upgrade e UX

  - Criar componentes reutilizáveis para prompts de upgrade
  - Implementar mensagens explicativas para restrições
  - Adicionar previews limitados de funcionalidades premium
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Criar componente UpgradePrompt

  - Implementar `components/premium/UpgradePrompt.tsx` reutilizável
  - Criar diferentes variantes para diferentes contextos (posts, reflexões, conexões)
  - Incluir botões de ação e links para página de upgrade
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 Implementar previews de conteúdo premium

  - Criar componente `PremiumContentPreview` que mostra teaser de conteúdo
  - Implementar blur/fade effect para conteúdo premium
  - Adicionar call-to-action para upgrade
  - _Requirements: 5.4_

- [x] 6.3 Atualizar mensagens de erro e restrições

  - Criar mensagens explicativas claras para cada tipo de restrição
  - Implementar tooltips e help text para funcionalidades restritas
  - Adicionar links contextuais para upgrade
  - _Requirements: 5.1, 5.3, 5.5_

- [x] 6.4 Criar testes para componentes de upgrade

  - Testar renderização de prompts de upgrade
  - Testar diferentes contextos e mensagens
  - Testar interações e navegação para upgrade
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Implementar validações e middleware de segurança

  - Criar middleware centralizado para verificação de permissões
  - Implementar validações server-side em todas as APIs relevantes
  - Adicionar logs de auditoria para tentativas de acesso negado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.4_

- [x] 7.1 Criar middleware de permissões centralizado

  - Implementar `lib/middleware/permissions.ts` para verificações centralizadas
  - Consolidar middleware existentes (postPermissions, connectionPermissions)
  - Criar decorators/wrappers para APIs que precisam de verificação
  - _Requirements: 1.1, 2.1_

- [x] 7.2 Implementar sistema de auditoria

  - Criar logs para tentativas de acesso negado
  - Implementar métricas de uso por tipo de utilizador
  - Adicionar alertas para padrões suspeitos
  - _Requirements: 3.3, 4.4_

- [x] 7.3 Criar testes de segurança

  - Testar bypass de permissões
  - Testar validações server-side
  - Testar logs de auditoria
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.4_

- [x] 8. Otimização e performance

  - Implementar cache de permissões
  - Otimizar queries de base de dados para filtragem
  - Implementar lazy loading para funcionalidades premium
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 8.1 Implementar cache de permissões

  - Criar sistema de cache para estados de permissões
  - Implementar invalidação de cache em mudanças de subscrição
  - Otimizar verificações repetidas de permissões
  - _Requirements: 4.2, 4.3_

- [x] 8.2 Otimizar queries de base de dados

  - Adicionar índices para queries de filtragem
  - Implementar filtragem a nível de base de dados
  - Otimizar joins para verificações de permissões
  - _Requirements: 4.3, 4.4_

- [x] 8.3 Criar testes de performance

  - Testar tempos de resposta de verificações de permissões
  - Testar performance de queries filtradas
  - Testar eficiência do cache
  - _Requirements: 4.2, 4.3, 4.4_
