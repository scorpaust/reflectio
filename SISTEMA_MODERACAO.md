# Sistema de Moderação de Conteúdo

## Visão Geral

Sistema completo de validação, filtragem e prevenção para mensagens de ódio tanto em formato texto como áudio, utilizando IA (OpenAI) para análise contextual e detecção de conteúdo inadequado.

## Funcionalidades

### 🔍 Moderação de Texto

- **Análise em tempo real** com debounce configurável
- **Detecção de discurso de ódio** usando OpenAI Moderation API
- **Análise contextual brasileira** com GPT-4o-mini
- **Verificação de palavras bloqueadas** localmente
- **Regras customizáveis** com regex
- **Sugestões de melhoria** automáticas

### 🎤 Moderação de Áudio

- **Transcrição automática** com Whisper
- **Gravação em tempo real** com limite de duração
- **Upload de arquivos** de áudio
- **Moderação da transcrição** com mesmo sistema de texto
- **Avaliação de qualidade** da transcrição

### ⚡ Recursos Avançados

- **Moderação em tempo real** com feedback visual
- **Sistema de override** para falsos positivos
- **Níveis de severidade** (baixo, médio, alto)
- **Modo estrito** configurável
- **Middleware para APIs** com moderação automática
- **Logging e auditoria** de eventos

## Estrutura do Sistema

```
/api/moderation/
├── text/route.ts          # API de moderação de texto
└── audio/route.ts         # API de moderação de áudio

/components/moderation/
├── ModerationFeedback.tsx      # Feedback visual dos resultados
├── ModeratedTextInput.tsx      # Input de texto com moderação
├── ModeratedAudioInput.tsx     # Input de áudio com moderação
└── CreatePostWithModeration.tsx # Exemplo de uso completo

/lib/
├── hooks/useModeration.ts      # Hook para moderação
├── utils/moderation.ts         # Utilitários e configurações
└── middleware/moderation.ts    # Middleware para APIs

/types/moderation.ts           # Tipos TypeScript
```

## Configuração

### 1. Variáveis de Ambiente

```env
# OpenAI para moderação
OPENAI_API_KEY=your_openai_api_key_here

# Configurações
NEXT_PUBLIC_APP_URL=http://localhost:3000
MODERATION_STRICT_MODE=false
MODERATION_AUTO_BLOCK=true
```

### 2. Instalação de Dependências

```bash
npm install openai
```

### 3. Configuração da OpenAI

1. Crie uma conta na [OpenAI](https://platform.openai.com/)
2. Gere uma API key
3. Adicione a key no arquivo `.env.local`

## Como Usar

### Moderação de Texto

```tsx
import { ModeratedTextInput } from "@/components/moderation/ModeratedTextInput";

function MyComponent() {
  const [text, setText] = useState("");
  const [isValid, setIsValid] = useState(true);

  return (
    <ModeratedTextInput
      value={text}
      onChange={setText}
      onValidationChange={setIsValid}
      strictMode={false}
      autoModerate={true}
    />
  );
}
```

### Moderação de Áudio

```tsx
import { ModeratedAudioInput } from "@/components/moderation/ModeratedAudioInput";

function MyComponent() {
  const handleAudioValidated = (file: File, transcription: string) => {
    console.log("Áudio aprovado:", { file, transcription });
  };

  return (
    <ModeratedAudioInput
      onAudioValidated={handleAudioValidated}
      maxDuration={300}
      strictMode={false}
    />
  );
}
```

### Hook de Moderação

```tsx
import { useModeration } from "@/lib/hooks/useModeration";

function MyComponent() {
  const { moderateText, moderateAudio, isLoading } = useModeration({
    strictMode: false,
    onModerationComplete: (result, action) => {
      console.log("Moderação completa:", { result, action });
    },
  });

  const handleSubmit = async (text: string) => {
    const { result, action } = await moderateText(text);

    if (action.type === "allow") {
      // Publicar conteúdo
    } else {
      // Mostrar feedback ao usuário
    }
  };
}
```

## APIs

### POST /api/moderation/text

Modera conteúdo de texto.

**Request:**

```json
{
  "text": "Texto para moderar"
}
```

**Response:**

```json
{
  "flagged": false,
  "severity": "low",
  "categories": [],
  "reason": "Conteúdo aprovado",
  "suggestions": [],
  "confidence": 0.1
}
```

### POST /api/moderation/audio

Modera arquivo de áudio (transcreve e analisa).

**Request:** FormData com arquivo de áudio

**Response:**

```json
{
  "flagged": false,
  "transcription": "Texto transcrito do áudio",
  "severity": "low",
  "categories": [],
  "reason": "Conteúdo aprovado",
  "transcriptionQuality": "good",
  "suggestions": [],
  "confidence": 0.1
}
```

## Configurações Avançadas

### Regras Customizadas

```typescript
const customRules: CustomModerationRule[] = [
  {
    id: "no-caps",
    name: "Texto em maiúsculas",
    pattern: "^[A-Z\\s]+$",
    severity: "low",
    action: "warn",
    description: "Evite escrever tudo em maiúsculas",
  },
];
```

### Palavras Bloqueadas

```typescript
const blockedWords = [
  "palavra1",
  "palavra2",
  // Adicione conforme necessário
];
```

### Middleware para APIs

```typescript
import { withModeration } from "@/lib/middleware/moderation";

export const POST = withModeration(
  async (req: NextRequest) => {
    // Sua lógica da API aqui
  },
  {
    enableTextModeration: true,
    strictMode: false,
    autoBlock: true,
  }
);
```

## Categorias de Moderação

- **hate**: Discurso de ódio
- **harassment**: Assédio
- **violence**: Violência
- **sexual**: Conteúdo sexual
- **self-harm**: Autolesão
- **bullying**: Bullying
- **discrimination**: Discriminação
- **spam**: Spam
- **inappropriate**: Conteúdo inadequado

## Níveis de Severidade

- **low**: Conteúdo questionável, mas não necessariamente inadequado
- **medium**: Conteúdo potencialmente inadequado, requer atenção
- **high**: Conteúdo claramente inadequado, deve ser bloqueado

## Ações de Moderação

- **allow**: Permitir publicação
- **warn**: Avisar usuário, mas permitir override
- **block**: Bloquear completamente
- **review**: Enviar para revisão manual

## Considerações de Performance

- **Debounce**: Moderação de texto usa debounce de 1s por padrão
- **Cache**: Considere implementar cache para textos já moderados
- **Rate Limiting**: Implemente rate limiting nas APIs de moderação
- **Batch Processing**: Para múltiplos textos, considere processamento em lote

## Privacidade e Segurança

- **Dados Sensíveis**: Conteúdo não é armazenado permanentemente
- **Logs**: Apenas metadados são logados para auditoria
- **Criptografia**: Considere criptografar dados em trânsito
- **Compliance**: Sistema compatível com LGPD/GDPR

## Monitoramento

- **Métricas**: Taxa de falsos positivos/negativos
- **Performance**: Tempo de resposta das APIs
- **Uso**: Volume de moderações por período
- **Qualidade**: Feedback dos usuários sobre moderação

## Próximos Passos

1. **Implementar cache** para melhorar performance
2. **Adicionar dashboard** de moderação para admins
3. **Criar sistema de appeals** para contestar moderações
4. **Implementar ML local** para reduzir dependência de APIs externas
5. **Adicionar moderação de imagens** usando Computer Vision
6. **Criar sistema de reputação** baseado no histórico do usuário

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs de erro no console
2. Confirme se a API key da OpenAI está configurada
3. Teste as APIs diretamente usando ferramentas como Postman
4. Verifique se as permissões de microfone estão habilitadas (para áudio)
