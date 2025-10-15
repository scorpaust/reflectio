# Reflectio

**A Rede Social que Incentiva o Pensamento Profundo**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.75-green)](https://supabase.com/)

## Sobre o Projeto

Reflectio é uma plataforma de rede social revolucionária que promove a reflexão cultural e o crescimento intelectual. Diferente das redes sociais convencionais, focamos em conteúdo de qualidade, pensamento crítico e conexões significativas.

### Características Principais

- **Conteúdo Cultural**: Partilhe críticas de livros, filmes, pensamentos filosóficos e obras artísticas
- **Sistema de Níveis**: Evolua de Iniciante a Sábio através da qualidade das suas reflexões
- **Conexões Significativas**: Conecte-se com pensadores do seu nível para diálogos profundos
- **Moderação Inteligente com IA**: Sistema avançado de moderação usando OpenAI para filtrar conteúdo inadequado
- **Audio-Posts**: Grave reflexões em áudio com transcrição e moderação automáticas
- **Sistema de Premium**: Recursos exclusivos através de integração com Stripe
- **Gamificação**: Sistema de pontos e níveis que incentiva contribuições de qualidade

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.4** - Framework React com App Router e Turbopack
- **React 19.1.0** - Biblioteca de interface de utilizador
- **TypeScript 5.x** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utility-first
- **Lucide React** - Ícones modernos
- **Zustand** - Gestão de estado global

### Backend e Serviços
- **Supabase** - Backend-as-a-Service (Base de dados PostgreSQL, Autenticação, Storage)
- **OpenAI API** - Moderação de conteúdo e transcrição de áudio (Whisper)
- **Stripe** - Processamento de pagamentos
- **Next.js API Routes** - Endpoints serverless

### Bibliotecas Auxiliares
- **React Hook Form** - Gestão de formulários
- **Zod** - Validação de schemas
- **date-fns** - Manipulação de datas
- **RecordRTC** - Gravação de áudio
- **WaveSurfer.js** - Visualização de áudio

## Requisitos do Sistema

- Node.js 20.x ou superior
- npm, yarn, pnpm ou bun
- Conta Supabase (gratuita ou paga)
- Conta OpenAI com créditos
- Conta Stripe (para funcionalidades premium)

## Instalação Rápida

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/reflectio.git
cd reflectio

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Executar migrações do Supabase
# (Ver documentação completa em docs/INSTALLATION.md)

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## Configuração

### Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute as migrações SQL em `supabase/migrations/`
3. Configure as políticas de storage para avatares e áudio
4. Desative Row Level Security (RLS) temporariamente para testes (ver `README_URGENTE.md`)

Para instruções detalhadas, consulte [docs/INSTALLATION.md](docs/INSTALLATION.md).

## Estrutura do Projeto

```
reflectio/
├── app/                      # App Router do Next.js
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── (dashboard)/         # Rotas protegidas
│   │   ├── feed/
│   │   ├── profile/
│   │   ├── connections/
│   │   └── progress/
│   ├── api/                 # API Routes
│   │   └── moderation/      # Endpoints de moderação
│   └── test-moderation/     # Página de testes
├── components/              # Componentes React
│   ├── auth/               # Componentes de autenticação
│   ├── feed/               # Componentes do feed
│   ├── moderation/         # Componentes de moderação
│   ├── audio/              # Componentes de áudio
│   ├── profile/            # Componentes de perfil
│   └── ui/                 # Componentes de UI reutilizáveis
├── lib/                     # Utilitários e lógica de negócio
│   ├── hooks/              # React Hooks customizados
│   ├── supabase/           # Clients Supabase
│   ├── stripe/             # Integração Stripe
│   ├── utils/              # Funções utilitárias
│   └── middleware/         # Middlewares
├── store/                   # Stores Zustand
├── types/                   # Definições TypeScript
├── supabase/               # Configuração Supabase
│   └── migrations/         # Migrações SQL
├── public/                 # Ficheiros estáticos
└── docs/                   # Documentação (criar)
```

## Funcionalidades Principais

### Sistema de Moderação

Moderação automática de texto e áudio usando IA da OpenAI:

- Deteção de discurso de ódio em tempo real
- Análise contextual brasileira
- Transcrição automática de áudio com Whisper
- Sugestões de melhoria
- Sistema de override para falsos positivos

Ver documentação completa: [SISTEMA_MODERACAO.md](SISTEMA_MODERACAO.md)

### Audio-Posts

Sistema completo de gravação, upload e moderação de posts em áudio:

- Gravação em tempo real
- Upload de ficheiros de áudio
- Transcrição automática
- Moderação do conteúdo transcrito
- Player de áudio integrado

### Sistema de Níveis

Evolução do utilizador baseada na qualidade das reflexões:

1. 🌱 **Iniciante** (0-99 pontos)
2. 💭 **Reflexivo** (100-499 pontos)
3. 🧠 **Pensador** (500-1499 pontos)
4. 📜 **Filósofo** (1500-3999 pontos)
5. ✨ **Sábio** (4000+ pontos)

### Conexões Inteligentes

Sistema que permite conectar apenas com utilizadores do mesmo nível ou inferior, promovendo mentorias e diálogos equilibrados.

## Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start
```

## Documentação Completa

- [Guia de Instalação](docs/INSTALLATION.md) - Instruções detalhadas de setup
- [Sistema de Moderação](SISTEMA_MODERACAO.md) - Como usar o sistema de moderação
- [Integração de Moderação](INTEGRACAO_MODERACAO.md) - Guia de integração
- [Exemplos de Uso](EXEMPLO_USO.md) - Exemplos práticos de componentes
- [Setup de Moderação](SETUP_MODERACAO.md) - Configuração inicial
- [Guia de Contribuição](CONTRIBUTING.md) - Como contribuir para o projeto
- [Changelog](CHANGELOG.md) - Histórico de versões

## Problemas Conhecidos

### Posts não funcionam (RLS)

Se encontrar erros ao criar posts, veja [README_URGENTE.md](README_URGENTE.md) para solução rápida.

### Performance do Supabase

Para otimizar queries, consulte [SUPABASE_PERFORMANCE_FIX.md](SUPABASE_PERFORMANCE_FIX.md).

## Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

Leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão.

## Roadmap

- [ ] Sistema de cache para moderação
- [ ] Dashboard de administração
- [ ] Sistema de appeals para moderações
- [ ] Moderação de imagens com Computer Vision
- [ ] Sistema de reputação avançado
- [ ] Notificações em tempo real
- [ ] Mobile App (React Native)
- [ ] Internacionalização (i18n)

## Licença

Este projeto está licenciado sob a Licença MIT - veja o ficheiro [LICENSE](LICENSE) para detalhes.

## Autor

**Dinis Costa**

- GitHub: [@dinis-costa](https://github.com/dinis-costa)

## Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React excepcional
- [Supabase](https://supabase.com/) - Backend-as-a-Service poderoso
- [OpenAI](https://openai.com/) - APIs de IA revolucionárias
- [Vercel](https://vercel.com/) - Plataforma de hosting

## Suporte

Para questões e suporte:

- Abra uma [Issue](https://github.com/seu-usuario/reflectio/issues)
- Consulte a [Documentação](docs/)
- Email: seu-email@example.com

---

**Reflectio** - Cresça através da Reflexão Cultural ✨
