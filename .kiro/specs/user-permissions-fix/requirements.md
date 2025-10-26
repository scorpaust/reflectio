# Requirements Document - Correção de Permissões de Utilizadores

## Introduction

Este documento define os requisitos para corrigir as inconsistências no sistema de permissões entre utilizadores gratuitos e premium, garantindo que as funcionalidades estejam alinhadas com o modelo de negócio definido.

## Glossary

- **Sistema**: A plataforma Reflectio
- **Utilizador_Gratuito**: Utilizador sem subscrição premium ativa
- **Utilizador_Premium**: Utilizador com subscrição premium ativa
- **Post_Premium**: Post marcado como conteúdo premium
- **Post_Público**: Post não marcado como premium
- **Reflexão**: Comentário/resposta criada sobre um post
- **Conexão**: Relação de seguimento entre utilizadores
- **Moderação_IA**: Sistema de moderação automática com inteligência artificial

## Requirements

### Requirement 1

**User Story:** Como utilizador gratuito, quero ter limitações claras nas minhas interações, para que o modelo premium tenha valor.

#### Acceptance Criteria

1. WHEN um Utilizador_Gratuito visualiza posts, THE Sistema SHALL mostrar apenas Post_Público
2. WHEN um Utilizador_Gratuito tenta criar reflexão, THE Sistema SHALL permitir apenas em Post_Público de outros Utilizador_Gratuito
3. WHEN um Utilizador_Gratuito tenta marcar post como premium, THE Sistema SHALL bloquear a ação
4. WHEN um Utilizador_Gratuito recebe solicitação de conexão, THE Sistema SHALL permitir aceitar ou recusar
5. WHEN um Utilizador_Gratuito tenta solicitar conexão, THE Sistema SHALL bloquear a ação

### Requirement 2

**User Story:** Como utilizador premium, quero acesso completo às funcionalidades, para justificar o valor da subscrição.

#### Acceptance Criteria

1. WHEN um Utilizador_Premium visualiza posts, THE Sistema SHALL mostrar Post_Público e Post_Premium
2. WHEN um Utilizador_Premium cria reflexão, THE Sistema SHALL permitir em qualquer post
3. WHEN um Utilizador_Premium marca post como premium, THE Sistema SHALL permitir a ação
4. WHEN um Utilizador_Premium solicita conexão, THE Sistema SHALL permitir a ação
5. WHEN um Utilizador_Premium acede a funcionalidades, THE Sistema SHALL aplicar Moderação_IA apenas quando necessário

### Requirement 3

**User Story:** Como administrador do sistema, quero que a moderação seja aplicada de forma inteligente, para otimizar recursos e experiência.

#### Acceptance Criteria

1. WHEN um Utilizador_Premium cria conteúdo, THE Sistema SHALL aplicar Moderação_IA apenas se suspeito
2. WHEN um Utilizador_Gratuito cria conteúdo, THE Sistema SHALL aplicar Moderação_IA obrigatoriamente
3. WHEN conteúdo é moderado, THE Sistema SHALL registar o resultado para análise
4. WHEN moderação falha, THE Sistema SHALL permitir publicação mas registar para revisão manual
5. WHEN utilizador premium excede limites, THE Sistema SHALL aplicar moderação temporariamente

### Requirement 4

**User Story:** Como utilizador do sistema, quero que as funcionalidades prometidas estejam disponíveis, para ter uma experiência consistente.

#### Acceptance Criteria

1. WHEN um utilizador acede a estatísticas, THE Sistema SHALL mostrar dados básicos para todos
2. WHEN um Utilizador_Premium acede a estatísticas, THE Sistema SHALL mostrar dados detalhados adicionais
3. WHEN utilizador contacta suporte, THE Sistema SHALL registar tipo de utilizador
4. WHEN sistema processa pedidos, THE Sistema SHALL priorizar Utilizador_Premium quando aplicável
5. WHEN funcionalidade não existe, THE Sistema SHALL remover da documentação ou implementar

### Requirement 5

**User Story:** Como utilizador gratuito, quero entender claramente as limitações, para tomar decisão informada sobre upgrade.

#### Acceptance Criteria

1. WHEN Utilizador_Gratuito tenta ação restrita, THE Sistema SHALL mostrar mensagem explicativa
2. WHEN mensagem é mostrada, THE Sistema SHALL incluir opção de upgrade para premium
3. WHEN utilizador vê limitação, THE Sistema SHALL explicar benefício da versão premium
4. WHEN utilizador interage com conteúdo premium, THE Sistema SHALL mostrar preview limitado
5. WHEN utilizador tenta funcionalidade premium, THE Sistema SHALL redirecionar para página de upgrade
