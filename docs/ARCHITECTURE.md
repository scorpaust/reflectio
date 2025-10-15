# Arquitetura do Reflectio

Este documento descreve a arquitetura técnica, decisões de design e organização do projeto Reflectio.

## Visão Geral

Reflectio é uma aplicação web full-stack construída com Next.js 15, usando o App Router para renderização server-side e client-side. A aplicação utiliza Supabase como Backend-as-a-Service (BaaS) para base de dados, autenticação e storage.

## Stack Tecnológica

### Frontend

```
┌─────────────────────────────────────┐
│         React 19.1.0                │
│   (UI Components & State)           │
├─────────────────────────────────────┤
│      Next.js 15.5.4                 │
│  (App Router + Server Components)   │
├─────────────────────────────────────┤
│      Tailwind CSS 4                 │
│     (Utility-First CSS)             │
├─────────────────────────────────────┤
│         Zustand                     │
│    (Global State Management)        │
└─────────────────────────────────────┘
```

### Backend

```
┌─────────────────────────────────────┐
│      Next.js API Routes             │
│      (Serverless Functions)         │
├─────────────────────────────────────┤
│         Supabase                    │
│  (PostgreSQL + Auth + Storage)      │
├─────────────────────────────────────┤
│         OpenAI API                  │
│  (Moderation + Transcription)       │
├─────────────────────────────────────┤
│         Stripe API                  │
│     (Payment Processing)            │
└─────────────────────────────────────┘
```

## Arquitetura de Diretórios

```
reflectio/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Grupo de rotas de autenticação
│   │   ├── login/               # Página de login
│   │   ├── register/            # Página de registro
│   │   ├── callback/            # Callback OAuth
│   │   └── layout.tsx           # Layout compartilhado (sem navbar)
│   │
│   ├── (dashboard)/             # Grupo de rotas protegidas
│   │   ├── feed/                # Feed principal
│   │   ├── profile/             # Perfil do utilizador
│   │   ├── connections/         # Conexões e networking
│   │   ├── progress/            # Progresso e estatísticas
│   │   └── layout.tsx           # Layout com navbar e sidebar
│   │
│   ├── api/                     # API Routes (Serverless)
│   │   └── moderation/          # Endpoints de moderação
│   │       ├── text/route.ts    # POST /api/moderation/text
│   │       └── audio/route.ts   # POST /api/moderation/audio
│   │
│   ├── layout.tsx               # Root layout (Providers globais)
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Estilos globais
│
├── components/                   # Componentes React
│   ├── auth/                    # Autenticação
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthProvider.tsx
│   │
│   ├── feed/                    # Feed e posts
│   │   ├── CreatePost.tsx
│   │   ├── PostCard.tsx
│   │   ├── ReflectionModal.tsx
│   │   └── FeedList.tsx
│   │
│   ├── moderation/              # Sistema de moderação
│   │   ├── ModeratedTextInput.tsx
│   │   ├── ModeratedAudioInput.tsx
│   │   ├── ModerationFeedback.tsx
│   │   └── CreatePostWithModeration.tsx
│   │
│   ├── audio/                   # Componentes de áudio
│   │   ├── AudioRecorder.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── AudioUpload.tsx
│   │
│   ├── profile/                 # Perfil
│   │   ├── ProfileCard.tsx
│   │   ├── AvatarUpload.tsx
│   │   └── LevelBadge.tsx
│   │
│   ├── connections/             # Networking
│   │   ├── ConnectionCard.tsx
│   │   ├── ConnectionsList.tsx
│   │   └── FollowButton.tsx
│   │
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   │
│   ├── ui/                      # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   │
│   └── providers/               # Context Providers
│       └── SupabaseProvider.tsx
│
├── lib/                         # Lógica de negócio e utilitários
│   ├── supabase/               # Clientes Supabase
│   │   ├── client.ts           # Client-side
│   │   ├── server.ts           # Server-side
│   │   └── middleware.ts       # Middleware de auth
│   │
│   ├── hooks/                  # React Hooks customizados
│   │   ├── useModeration.ts    # Hook de moderação
│   │   ├── useAuth.ts          # Hook de autenticação
│   │   └── usePosts.ts         # Hook para posts
│   │
│   ├── utils/                  # Funções utilitárias
│   │   ├── moderation.ts       # Utilitários de moderação
│   │   ├── validators.ts       # Validações
│   │   └── formatters.ts       # Formatação de dados
│   │
│   ├── middleware/             # Middlewares
│   │   └── moderation.ts       # Middleware de moderação para APIs
│   │
│   ├── stripe/                 # Integração Stripe
│   │   └── client.ts
│   │
│   ├── constants.ts            # Constantes da aplicação
│   └── utils.ts                # Utilitários gerais
│
├── store/                       # Zustand stores
│   ├── authStore.ts            # Estado de autenticação
│   └── userStore.ts            # Estado do utilizador
│
├── types/                       # Definições TypeScript
│   ├── database.types.ts       # Tipos gerados do Supabase
│   ├── moderation.ts           # Tipos de moderação
│   ├── post.types.ts           # Tipos de posts
│   └── user.types.ts           # Tipos de utilizador
│
├── supabase/                    # Configuração Supabase
│   ├── migrations/             # Migrações SQL
│   │   └── *.sql
│   └── storage-policies.sql    # Políticas de storage
│
├── public/                      # Ficheiros estáticos
│   ├── images/
│   └── favicon.ico
│
├── docs/                        # Documentação
│   ├── INSTALLATION.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── .env.local                   # Variáveis de ambiente (não commitado)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── middleware.ts                # Next.js middleware (auth global)
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

## Fluxo de Dados

### Autenticação

```
┌─────────┐      ┌──────────┐      ┌──────────┐      ┌─────────┐
│  User   │─────▶│  Login   │─────▶│ Supabase │─────▶│  Auth   │
│         │      │   Form   │      │   Auth   │      │  Store  │
└─────────┘      └──────────┘      └──────────┘      └─────────┘
                       │                  │
                       │                  ▼
                       │            ┌──────────┐
                       └───────────▶│ Callback │
                                    │  Route   │
                                    └──────────┘
```

### Criação de Post com Moderação

```
┌──────────┐      ┌───────────┐      ┌──────────┐
│   User   │─────▶│ CreatePost│─────▶│Moderation│
│  Input   │      │ Component │      │   Hook   │
└──────────┘      └───────────┘      └──────────┘
                        │                  │
                        │                  ▼
                        │            ┌──────────┐
                        │            │ OpenAI   │
                        │            │   API    │
                        │            └──────────┘
                        │                  │
                        ▼                  ▼
                  ┌──────────┐      ┌──────────┐
                  │ Feedback │◀─────│  Result  │
                  │    UI    │      │          │
                  └──────────┘      └──────────┘
                        │
                        ▼
                  ┌──────────┐
                  │ Supabase │
                  │    DB    │
                  └──────────┘
```

### Audio-Post com Transcrição

```
┌──────────┐      ┌───────────┐      ┌──────────┐
│   User   │─────▶│  Record   │─────▶│ Supabase │
│  Audio   │      │   Audio   │      │  Storage │
└──────────┘      └───────────┘      └──────────┘
                        │                  │
                        ▼                  │
                  ┌──────────┐            │
                  │ Whisper  │            │
                  │   API    │            │
                  └──────────┘            │
                        │                  │
                        ▼                  │
                  ┌──────────┐            │
                  │Transcript│            │
                  └──────────┘            │
                        │                  │
                        ▼                  ▼
                  ┌──────────┐      ┌──────────┐
                  │Moderation│─────▶│ Supabase │
                  │          │      │    DB    │
                  └──────────┘      └──────────┘
```

## Padrões de Design

### 1. Server Components vs Client Components

**Server Components** (padrão no Next.js 15):
- Renderizam no servidor
- Acesso direto à base de dados
- Melhor SEO
- Menor bundle JavaScript

```typescript
// app/feed/page.tsx (Server Component)
export default async function FeedPage() {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return <FeedList posts={posts} />;
}
```

**Client Components** (com 'use client'):
- Interatividade
- Hooks (useState, useEffect, etc.)
- Event handlers
- Browser APIs

```typescript
// components/feed/CreatePost.tsx (Client Component)
'use client';

export function CreatePost() {
  const [text, setText] = useState('');
  const handleSubmit = () => { /* ... */ };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2. Composição de Componentes

Preferimos composição sobre herança:

```typescript
// ❌ NÃO FAZER: Herança
class BaseButton extends React.Component { }
class PrimaryButton extends BaseButton { }

// ✅ FAZER: Composição
function Button({ variant, children }) {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

function PrimaryButton({ children }) {
  return <Button variant="primary">{children}</Button>;
}
```

### 3. Hooks Customizados

Encapsulamos lógica reutilizável em hooks:

```typescript
// lib/hooks/useModeration.ts
export function useModeration(options: ModerationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateText = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/moderation/text', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { moderateText, isLoading, error };
}
```

### 4. Gestão de Estado

**Local State**: useState para estado de componente
**Global State**: Zustand para estado compartilhado
**Server State**: Server Components + Suspense

```typescript
// store/authStore.ts (Zustand)
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### 5. Validação de Dados

Usamos Zod para validação de schemas:

```typescript
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(2000),
  type: z.enum(['text', 'audio']),
});

type Post = z.infer<typeof PostSchema>;
```

## Modelo de Dados

### Schema Principal (Supabase/PostgreSQL)

```sql
-- Utilizadores
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'audio')),
  audio_url TEXT,
  transcription TEXT,
  moderation_score NUMERIC,
  reflection_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reflexões (Comentários)
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  moderation_score NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conexões
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Logs de Moderação
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  result JSONB,
  action TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relações

```
profiles (1) ─────── (*) posts
    │                     │
    │                     │
    │                (*) reflections
    │
    └─── (follower) connections (following) ───┐
                                               │
                                               └─── profiles
```

## APIs e Endpoints

### API Routes do Next.js

```
POST   /api/moderation/text      # Moderação de texto
POST   /api/moderation/audio     # Moderação de áudio
POST   /api/webhooks/stripe      # Webhooks Stripe
```

### Supabase (via SDK)

```typescript
// Operações CRUD diretas via Supabase client
supabase.from('posts').select('*');
supabase.from('posts').insert({ ... });
supabase.from('posts').update({ ... });
supabase.from('posts').delete();
```

## Segurança

### Autenticação

- **JWT Tokens**: Supabase gere tokens JWT
- **Row Level Security (RLS)**: Políticas no PostgreSQL
- **Middleware**: Next.js middleware verifica autenticação

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({ req: request });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

### Moderação de Conteúdo

1. **Client-side**: Validação básica e feedback imediato
2. **Server-side**: Moderação via OpenAI API
3. **Database**: Logs de moderação para auditoria

### Proteção de API Keys

- Variáveis de ambiente
- Service role keys apenas em server-side
- Nunca expor keys no client

## Performance

### Otimizações

1. **Server Components**: Renderização no servidor
2. **Image Optimization**: Next.js Image component
3. **Code Splitting**: Automático com Next.js
4. **Lazy Loading**: React.lazy() para componentes pesados
5. **Caching**: Headers de cache adequados
6. **Debouncing**: Em inputs de moderação

### Monitoramento

- Vercel Analytics (se hospedado na Vercel)
- Supabase Logs
- OpenAI Usage Dashboard

## Deployment

### Vercel (Recomendado)

```bash
# Deploy via CLI
vercel

# OU conectar repositório GitHub
# Push automático em merge para main
```

### Outras Plataformas

- **Netlify**: Suportado
- **Docker**: Dockerfile incluído
- **Self-hosted**: Node.js server

## Testes (Futuro)

### Estratégia de Testes

```
├── __tests__/
│   ├── unit/                # Testes unitários
│   ├── integration/         # Testes de integração
│   └── e2e/                 # Testes end-to-end
```

**Ferramentas planejadas**:
- Jest: Testes unitários
- React Testing Library: Testes de componentes
- Playwright: Testes E2E

## Contribuição

Para contribuir com melhorias arquiteturais:

1. Leia [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Discuta mudanças significativas via Issues primeiro
3. Mantenha consistência com padrões existentes
4. Atualize esta documentação se necessário

---

**Última atualização**: Janeiro 2025
