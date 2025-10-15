# Setup do Sistema de Moderação

## ✅ Passos Concluídos

1. **Dependências instaladas** - OpenAI SDK configurado
2. **Conflito de Zod resolvido** - Downgrade para v3.23.8 (compatível com OpenAI)
3. **Sistema implementado** - APIs, componentes e hooks criados
4. **Página de teste criada** - `/test-moderation` para testar funcionalidades

## 🔧 Configuração Necessária

### 1. Obter API Key da OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá em **API Keys** no menu lateral
4. Clique em **Create new secret key**
5. Copie a chave gerada

### 2. Configurar Variáveis de Ambiente

Abra o arquivo `.env.local` e substitua:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Por:

```env
OPENAI_API_KEY=sk-proj-sua_chave_aqui
```

### 3. Testar o Sistema

1. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

2. **Acesse a página de teste:**

   ```
   http://localhost:3000/test-moderation
   ```

3. **Teste diferentes cenários:**
   - Texto normal: "Que reflexão interessante!"
   - Texto questionável: "Você é um idiota"
   - Áudio: Grave mensagens com diferentes conteúdos

## 🎯 Funcionalidades Disponíveis

### Moderação de Texto

- ✅ Análise em tempo real com debounce
- ✅ Detecção de discurso de ódio
- ✅ Contexto cultural brasileiro
- ✅ Sugestões de melhoria
- ✅ Sistema de override

### Moderação de Áudio

- ✅ Gravação em tempo real
- ✅ Upload de arquivos
- ✅ Transcrição automática
- ✅ Moderação da transcrição
- ✅ Avaliação de qualidade

### Componentes Prontos

- ✅ `ModeratedTextInput` - Input com moderação
- ✅ `ModeratedAudioInput` - Gravação/upload com moderação
- ✅ `CreatePostWithModeration` - Exemplo completo
- ✅ `ModerationFeedback` - Feedback visual

## 🔍 Como Integrar no Seu App

### 1. Em Formulários de Post

```tsx
import { CreatePostWithModeration } from "@/components/feed/CreatePostWithModeration";

function FeedPage() {
  return (
    <CreatePostWithModeration
      onPostCreated={(content, audioFile, transcription) => {
        // Salvar post no banco de dados
        console.log({ content, audioFile, transcription });
      }}
    />
  );
}
```

### 2. Em Comentários

```tsx
import { ModeratedTextInput } from "@/components/moderation/ModeratedTextInput";

function CommentForm() {
  const [comment, setComment] = useState("");
  const [isValid, setIsValid] = useState(true);

  return (
    <ModeratedTextInput
      value={comment}
      onChange={setComment}
      onValidationChange={setIsValid}
      placeholder="Escreva seu comentário..."
    />
  );
}
```

### 3. Em Mensagens Diretas

```tsx
import { ModeratedAudioInput } from "@/components/moderation/ModeratedAudioInput";

function MessageForm() {
  return (
    <ModeratedAudioInput
      onAudioValidated={(file, transcription) => {
        // Enviar mensagem de áudio
      }}
      maxDuration={60} // 1 minuto
    />
  );
}
```

## 🛠️ Personalização

### Configurar Modo Estrito

```tsx
<ModeratedTextInput
  strictMode={true} // Mais rigoroso na moderação
  autoModerate={true}
/>
```

### Adicionar Palavras Bloqueadas

Edite `lib/utils/moderation.ts`:

```typescript
export const OFFENSIVE_WORDS_PT = [
  "palavra1",
  "palavra2",
  // Adicione suas palavras
];
```

### Criar Regras Customizadas

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

## 📊 Monitoramento

### Logs de Moderação

Os eventos são logados automaticamente no console. Para produção, considere:

1. **Salvar no banco de dados** para auditoria
2. **Métricas de performance** (tempo de resposta)
3. **Taxa de falsos positivos** (feedback dos usuários)
4. **Volume de moderações** por período

### Dashboard de Moderação

Considere criar um dashboard para administradores com:

- Estatísticas de moderação
- Conteúdo flagged para revisão
- Configuração de regras
- Histórico de ações

## 🚨 Troubleshooting

### Erro: "OpenAI API key not found"

- Verifique se a chave está no `.env.local`
- Reinicie o servidor após adicionar a chave

### Erro: "Failed to fetch"

- Verifique sua conexão com internet
- Confirme se a API key é válida
- Verifique se há créditos na conta OpenAI

### Moderação muito rigorosa

- Desative o `strictMode`
- Ajuste as regras customizadas
- Implemente sistema de appeals

### Moderação muito permissiva

- Ative o `strictMode`
- Adicione mais palavras bloqueadas
- Crie regras customizadas específicas

## 💰 Custos da OpenAI

### Preços Aproximados (Janeiro 2024)

- **GPT-4o-mini**: $0.15 / 1M tokens de input
- **Whisper**: $0.006 / minuto de áudio
- **Moderation**: Gratuito

### Estimativa de Uso

- **Texto curto (100 palavras)**: ~$0.0001
- **Áudio (1 minuto)**: ~$0.006
- **1000 moderações/dia**: ~$2-5/mês

## 🔐 Segurança e Privacidade

- ✅ Conteúdo não é armazenado pela OpenAI
- ✅ Dados trafegam criptografados (HTTPS)
- ✅ Apenas metadados são logados
- ✅ Compatível com LGPD/GDPR

## 📈 Próximos Passos

1. **Testar em produção** com usuários reais
2. **Coletar feedback** sobre falsos positivos
3. **Ajustar regras** baseado no uso
4. **Implementar cache** para melhor performance
5. **Adicionar moderação de imagens** (futuro)

---

**Status:** ✅ Sistema pronto para uso
**Teste:** http://localhost:3000/test-moderation
**Documentação:** SISTEMA_MODERACAO.md
