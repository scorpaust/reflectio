# Como Usar o Sistema de Moderação Integrado

## 🎯 **Uso Imediato - Componentes Prontos**

### **1. Criar Posts com Moderação**

```tsx
import { CreatePost } from "@/components/feed/CreatePost";

function FeedPage() {
  const handlePostCreated = () => {
    // Recarregar feed ou fazer outras ações
    console.log("Post criado com moderação!");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost onPostCreated={handlePostCreated} />
      {/* Resto do feed */}
    </div>
  );
}
```

### **2. Modal de Reflexões com Moderação**

```tsx
import { ReflectionModal } from "@/components/feed/ReflectionModal";

function PostCard({ post }) {
  const [showReflections, setShowReflections] = useState(false);

  return (
    <>
      <div className="post-card">
        <button onClick={() => setShowReflections(true)}>Ver Reflexões</button>
      </div>

      <ReflectionModal
        isOpen={showReflections}
        onClose={() => setShowReflections(false)}
        postId={post.id}
        postTitle={post.title}
        onReflectionCreated={() => {
          // Atualizar contadores, etc.
        }}
      />
    </>
  );
}
```

## 🔧 **Componentes Individuais de Moderação**

### **3. Input de Texto Moderado**

```tsx
import { ModeratedTextInput } from "@/components/moderation/ModeratedTextInput";

function CommentForm() {
  const [comment, setComment] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleSubmit = () => {
    if (!isValid) {
      alert("Por favor, corrija o conteúdo antes de enviar");
      return;
    }
    // Enviar comentário
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModeratedTextInput
        value={comment}
        onChange={setComment}
        onValidationChange={setIsValid}
        placeholder="Escreva seu comentário..."
        maxLength={1000}
        strictMode={false}
        autoModerate={true}
      />

      <button type="submit" disabled={!comment.trim() || !isValid}>
        Enviar
      </button>
    </form>
  );
}
```

### **4. Input de Áudio Moderado**

```tsx
import { ModeratedAudioInput } from "@/components/moderation/ModeratedAudioInput";

function VoiceMessageForm() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleAudioValidated = (file: File, transcript: string) => {
    setAudioFile(file);
    setTranscription(transcript);
    console.log("Áudio aprovado:", { file, transcript });
  };

  return (
    <div>
      <ModeratedAudioInput
        onAudioValidated={handleAudioValidated}
        onValidationChange={setIsValid}
        maxDuration={120} // 2 minutos
        strictMode={false}
      />

      {transcription && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4>Transcrição:</h4>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
```

## 🎨 **Personalização Visual**

### **5. Customizar Feedback de Moderação**

```tsx
import { ModerationFeedback } from "@/components/moderation/ModerationFeedback";

function CustomModerationDisplay({ result, action }) {
  return (
    <ModerationFeedback
      result={result}
      action={action}
      onOverride={() => {
        console.log("Usuário escolheu publicar mesmo assim");
      }}
      onCancel={() => {
        console.log("Usuário cancelou");
      }}
      className="my-custom-styles"
    />
  );
}
```

## ⚙️ **Configurações Avançadas**

### **6. Hook de Moderação Personalizado**

```tsx
import { useModeration } from "@/lib/hooks/useModeration";

function CustomModerationComponent() {
  const { moderateText, moderateAudio, isLoading, error } = useModeration({
    strictMode: true, // Mais rigoroso
    autoBlock: true, // Bloquear automaticamente
    onModerationComplete: (result, action) => {
      console.log("Moderação completa:", { result, action });

      // Salvar no analytics
      analytics.track("content_moderated", {
        flagged: result.flagged,
        severity: result.severity,
        action: action.type,
      });
    },
  });

  const handleModerateText = async (text: string) => {
    try {
      const { result, action } = await moderateText(text);

      if (action.type === "block") {
        alert("Conteúdo bloqueado");
        return;
      }

      if (action.type === "warn") {
        const proceed = confirm("Conteúdo pode ser inadequado. Continuar?");
        if (!proceed) return;
      }

      // Prosseguir com publicação
      publishContent(text);
    } catch (error) {
      console.error("Erro na moderação:", error);
    }
  };

  return (
    <div>
      <textarea onChange={(e) => handleModerateText(e.target.value)} />
      {isLoading && <p>Verificando conteúdo...</p>}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

### **7. Middleware para APIs**

```tsx
// app/api/posts/route.ts
import { withModeration } from "@/lib/middleware/moderation";

export const POST = withModeration(
  async (req: NextRequest) => {
    // Sua lógica de criação de post
    const body = await req.json();

    // O conteúdo já foi moderado pelo middleware
    const post = await createPost(body);

    return NextResponse.json(post);
  },
  {
    enableTextModeration: true,
    strictMode: false,
    autoBlock: true,
  }
);
```

## 📊 **Monitoramento e Analytics**

### **8. Tracking de Moderação**

```tsx
import { logModerationEvent } from "@/lib/middleware/moderation";

function trackModeration(userId: string, content: string, result: any) {
  // Log interno
  logModerationEvent(userId, content, result, "allowed");

  // Analytics externo
  analytics.track("content_moderated", {
    user_id: userId,
    content_length: content.length,
    flagged: result.flagged,
    severity: result.severity,
    categories: result.categories,
    timestamp: new Date().toISOString(),
  });

  // Métricas para dashboard
  if (result.flagged) {
    incrementCounter("moderation.flagged");
    incrementCounter(`moderation.severity.${result.severity}`);
  }
}
```

## 🔧 **Configuração por Ambiente**

### **9. Configurações Dinâmicas**

```tsx
// lib/config/moderation.ts
export const getModerationConfig = () => {
  const env = process.env.NODE_ENV;

  return {
    strictMode: env === "production" ? false : true,
    autoBlock: env === "production" ? true : false,
    debounceMs: env === "development" ? 500 : 1000,
    enableLogging: env === "production",
    fallbackOnError: true,
  };
};

// Usar na aplicação
function MyComponent() {
  const config = getModerationConfig();

  return (
    <ModeratedTextInput
      strictMode={config.strictMode}
      debounceMs={config.debounceMs}
      // ... outras props
    />
  );
}
```

## 🚀 **Exemplos de Integração Completa**

### **10. Sistema de Comentários Completo**

```tsx
function CommentSystem({ postId }: { postId: string }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleSubmitComment = async () => {
    if (!isValid || !newComment.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulário de novo comentário */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <ModeratedTextInput
          value={newComment}
          onChange={setNewComment}
          onValidationChange={setIsValid}
          placeholder="Adicione um comentário respeitoso..."
          maxLength={500}
          rows={3}
          strictMode={false}
          autoModerate={true}
        />

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || !isValid}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Comentar
          </button>
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded border">
            <p>{comment.content}</p>
            <small className="text-gray-500">
              {comment.author.name} • {formatDate(comment.created_at)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ✅ **Checklist de Implementação**

- ✅ **OpenAI API Key configurada** no `.env.local`
- ✅ **Dependências instaladas** (`npm install`)
- ✅ **Componentes importados** corretamente
- ✅ **Tipos TypeScript** disponíveis
- ✅ **Fallbacks implementados** para erros de API
- ✅ **UX preservada** - mesma experiência visual
- ✅ **Performance otimizada** - debounce e cache
- ✅ **Monitoramento ativo** - logs e métricas

**Sistema pronto para uso em produção!** 🚀
