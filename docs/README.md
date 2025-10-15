# Documentação do Reflectio

Bem-vindo à documentação completa do Reflectio! Este diretório contém toda a documentação técnica, guias de utilizador e recursos de desenvolvimento.

## Índice da Documentação

### Para Começar

- **[Guia de Instalação](INSTALLATION.md)** - Instruções completas para configurar o Reflectio do zero
  - Requisitos do sistema
  - Configuração do Supabase
  - Configuração do OpenAI
  - Configuração do Stripe
  - Troubleshooting

### Arquitetura e Desenvolvimento

- **[Arquitetura](ARCHITECTURE.md)** - Visão geral da arquitetura técnica
  - Stack tecnológica
  - Estrutura de diretórios
  - Fluxo de dados
  - Padrões de design
  - Modelo de dados

### Sistema de Moderação

- **[Sistema de Moderação](../SISTEMA_MODERACAO.md)** - Documentação completa do sistema de moderação
  - Visão geral e funcionalidades
  - Estrutura do sistema
  - Configuração
  - APIs disponíveis

- **[Integração de Moderação](../INTEGRACAO_MODERACAO.md)** - Guia de integração
  - Como integrar em novos componentes
  - Melhores práticas

- **[Exemplos de Uso](../EXEMPLO_USO.md)** - Exemplos práticos
  - Componentes prontos
  - Casos de uso comuns
  - Personalização

- **[Setup de Moderação](../SETUP_MODERACAO.md)** - Configuração inicial
  - Passos para ativar a moderação
  - Configurações recomendadas

### Guias de Referência

- **[CHANGELOG](../CHANGELOG.md)** - Histórico de versões e mudanças
- **[CONTRIBUTING](../CONTRIBUTING.md)** - Como contribuir para o projeto
- **[README Principal](../README.md)** - Visão geral do projeto

### Problemas Conhecidos e Soluções

- **[README Urgente](../README_URGENTE.md)** - Problema crítico de RLS
- **[Correção de Posts](../COMO_CONSERTAR_POSTS.md)** - Como resolver problemas com posts
- **[Fix de Performance do Supabase](../SUPABASE_PERFORMANCE_FIX.md)** - Otimizações de performance
- **[Fix do Supabase](../SUPABASE_FIX.md)** - Correções gerais do Supabase

## Organização da Documentação

```
docs/
├── README.md                    # Este ficheiro (índice)
├── INSTALLATION.md              # Guia de instalação completo
└── ARCHITECTURE.md              # Documentação de arquitetura

../ (Raiz do projeto)
├── README.md                    # README principal
├── CONTRIBUTING.md              # Guia de contribuição
├── CHANGELOG.md                 # Histórico de mudanças
├── SISTEMA_MODERACAO.md         # Sistema de moderação
├── INTEGRACAO_MODERACAO.md      # Integração de moderação
├── EXEMPLO_USO.md               # Exemplos práticos
├── SETUP_MODERACAO.md           # Setup de moderação
├── README_URGENTE.md            # Problema crítico RLS
├── COMO_CONSERTAR_POSTS.md      # Fix de posts
├── SUPABASE_FIX.md              # Correções Supabase
└── SUPABASE_PERFORMANCE_FIX.md  # Performance Supabase
```

## Por Onde Começar?

### Se você é novo no projeto:

1. Leia o [README principal](../README.md) para entender o que é o Reflectio
2. Siga o [Guia de Instalação](INSTALLATION.md) para configurar localmente
3. Explore a [Arquitetura](ARCHITECTURE.md) para entender a estrutura do código

### Se você quer contribuir:

1. Leia [CONTRIBUTING.md](../CONTRIBUTING.md) para conhecer o processo
2. Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para entender os padrões
3. Veja o [CHANGELOG.md](../CHANGELOG.md) para saber o que há de novo

### Se você quer usar o sistema de moderação:

1. Comece com [SISTEMA_MODERACAO.md](../SISTEMA_MODERACAO.md)
2. Configure seguindo [SETUP_MODERACAO.md](../SETUP_MODERACAO.md)
3. Veja exemplos em [EXEMPLO_USO.md](../EXEMPLO_USO.md)
4. Integre usando [INTEGRACAO_MODERACAO.md](../INTEGRACAO_MODERACAO.md)

### Se você está com problemas:

1. Verifique [README_URGENTE.md](../README_URGENTE.md) para problemas críticos
2. Consulte a seção Troubleshooting em [INSTALLATION.md](INSTALLATION.md)
3. Veja os fixes específicos:
   - [COMO_CONSERTAR_POSTS.md](../COMO_CONSERTAR_POSTS.md)
   - [SUPABASE_FIX.md](../SUPABASE_FIX.md)
   - [SUPABASE_PERFORMANCE_FIX.md](../SUPABASE_PERFORMANCE_FIX.md)

## Estrutura de Ficheiros SQL

Ficheiros SQL importantes na raiz do projeto:

```
SQL Scripts/
├── create-avatars-bucket-simple.sql
├── debug-google-data.sql
├── fix-audio-bucket-policies.sql
├── fix-connections-counter.sql
├── fix-google-avatars.sql
├── minimal-posts-table.sql
├── recalculate-counters.sql
├── setup-audio-bucket.sql
└── setup-avatars-bucket.sql
```

## Manutenção da Documentação

### Quando Atualizar

- **CHANGELOG.md**: A cada versão ou funcionalidade importante
- **README.md**: Ao adicionar dependências ou mudar setup
- **ARCHITECTURE.md**: Ao fazer mudanças estruturais significativas
- **Docs específicas**: Ao alterar funcionalidades relacionadas

### Padrões de Documentação

1. **Use Markdown** para todos os documentos
2. **Inclua exemplos de código** sempre que possível
3. **Adicione índices** em documentos longos
4. **Mantenha consistência** de formatação
5. **Seja claro e conciso** - evite jargão desnecessário
6. **Atualize links** quando mover ficheiros

## Contribuir para a Documentação

Melhorias na documentação são sempre bem-vindas!

- Encontrou um erro? Abra uma Issue
- Quer melhorar algo? Abra um Pull Request
- Falta alguma informação? Sugira adições

Consulte [CONTRIBUTING.md](../CONTRIBUTING.md) para detalhes.

## Versão da Documentação

Esta documentação corresponde à versão **0.1.0** do Reflectio.

Última atualização: Janeiro 2025

---

**Reflectio** - Cresça através da Reflexão Cultural ✨
