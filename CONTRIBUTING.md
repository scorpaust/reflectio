# Guia de Contribuição

Obrigado por considerar contribuir para o **Reflectio**! Este documento fornece diretrizes para contribuir com o projeto.

## Código de Conduta

### Nossos Valores

- **Respeito mútuo**: Tratamos todos os contribuidores com respeito e profissionalismo
- **Pensamento crítico**: Valorizamos feedback construtivo e bem fundamentado
- **Qualidade sobre quantidade**: Preferimos contribuições bem pensadas e testadas
- **Colaboração**: Trabalhamos juntos para criar uma plataforma melhor

### Comportamentos Esperados

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas de forma profissional
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

### Comportamentos Inaceitáveis

- Uso de linguagem sexualizada ou imagens inadequadas
- Comentários insultuosos, depreciativos ou ataques pessoais
- Assédio público ou privado
- Publicação de informação privada de terceiros sem permissão
- Conduta que seria considerada inadequada num ambiente profissional

## Como Contribuir

### Reportar Bugs

Antes de criar um bug report:

1. **Verifique se já existe**: Pesquise nas [Issues](https://github.com/seu-usuario/reflectio/issues) existentes
2. **Versão atual**: Confirme que está usando a versão mais recente
3. **Reprodução**: Tente reproduzir o bug de forma consistente

Ao criar um bug report, inclua:

- **Título descritivo**: Seja específico sobre o problema
- **Passos para reproduzir**: Liste exatamente como reproduzir o bug
- **Comportamento esperado**: O que deveria acontecer
- **Comportamento atual**: O que está a acontecer
- **Screenshots**: Se aplicável
- **Ambiente**: Browser, OS, versões de Node.js, npm, etc.
- **Informação adicional**: Logs de erro, stack traces, etc.

**Template de Bug Report:**

```markdown
## Descrição
[Descrição clara e concisa do bug]

## Passos para Reproduzir
1. Ir para '...'
2. Clicar em '...'
3. Ver erro

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está a acontecer]

## Screenshots
[Se aplicável]

## Ambiente
- OS: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Node.js: [ex: 20.10.0]
- Versão do Reflectio: [ex: 0.1.0]

## Informação Adicional
[Logs, stack traces, contexto adicional]
```

### Sugerir Melhorias

Sugestões de melhorias são bem-vindas! Antes de sugerir:

1. **Verifique o roadmap**: Veja se já está planeado
2. **Pesquise Issues existentes**: Pode já ter sido sugerido
3. **Considere o escopo**: A sugestão alinha com os objetivos do projeto?

Ao sugerir uma melhoria, inclua:

- **Título claro**: Descreva a melhoria de forma concisa
- **Motivação**: Por que esta melhoria é útil?
- **Descrição detalhada**: Como deveria funcionar?
- **Alternativas**: Que outras abordagens considerou?
- **Impacto**: Como afetará os utilizadores existentes?

**Template de Feature Request:**

```markdown
## Resumo
[Descrição breve da feature]

## Motivação
[Por que esta feature é necessária?]

## Descrição Detalhada
[Como deveria funcionar? Inclua exemplos se possível]

## Alternativas Consideradas
[Que outras abordagens foram consideradas?]

## Impacto
[Como afetará utilizadores existentes?]
```

### Pull Requests

#### Antes de Começar

1. **Fork** o repositório
2. **Clone** o seu fork localmente
3. **Configure** as variáveis de ambiente (veja README.md)
4. **Crie um branch** a partir de `main`

```bash
git checkout -b feature/minha-contribuicao
# ou
git checkout -b fix/correcao-bug
```

#### Durante o Desenvolvimento

1. **Siga os padrões de código**:
   - Use TypeScript estrito
   - Siga as convenções de nomenclatura
   - Mantenha componentes pequenos e focados
   - Escreva código autodocumentado

2. **Escreva testes** (quando aplicável):
   - Teste unitários para funções utilitárias
   - Teste de integração para APIs
   - Teste de componentes React

3. **Documente o código**:
   - Adicione comentários JSDoc para funções públicas
   - Documente decisões de design complexas
   - Atualize a documentação relevante

4. **Commits semânticos**:
   - Use mensagens de commit claras e descritivas
   - Siga o padrão Conventional Commits

```bash
# Exemplos de boas mensagens de commit
feat: adiciona sistema de notificações em tempo real
fix: corrige erro de autenticação com Google OAuth
docs: atualiza guia de instalação com Supabase
style: formata código com Prettier
refactor: reorganiza estrutura de componentes de feed
test: adiciona testes para moderação de áudio
chore: atualiza dependências do projeto
```

#### Padrões de Código

**TypeScript:**

```typescript
// ✅ BOM: Tipagem explícita e clara
interface UserProfile {
  id: string;
  username: string;
  level: number;
  created_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Implementação...
}

// ❌ RUIM: Sem tipagem
export async function getUserProfile(userId) {
  // Implementação...
}
```

**React Components:**

```typescript
// ✅ BOM: Props tipadas, componente focado
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ RUIM: Props não tipadas
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

**Nomenclatura:**

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useModeration.ts`)
- **Funções utilitárias**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Tipos/Interfaces**: PascalCase (`UserProfile`, `ModerationResult`)

**Estrutura de Ficheiros:**

```
components/
├── feed/
│   ├── CreatePost.tsx           # Componente principal
│   ├── PostCard.tsx
│   ├── ReflectionModal.tsx
│   └── index.ts                 # Barrel export
```

#### Submeter Pull Request

1. **Push para o seu fork**:

```bash
git push origin feature/minha-contribuicao
```

2. **Crie o Pull Request** no GitHub

3. **Preencha o template de PR**:

```markdown
## Descrição
[Descrição clara do que foi alterado e por quê]

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que causa quebra de compatibilidade)
- [ ] Documentação

## Como Foi Testado?
[Descreva os testes realizados]

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Realizei self-review do código
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Mudanças não geram novos warnings
- [ ] Adicionei testes que provam que o fix/feature funciona
- [ ] Testes unitários novos e existentes passam localmente

## Screenshots (se aplicável)
[Adicione screenshots]

## Issues Relacionadas
Fixes #[número do issue]
```

4. **Aguarde revisão**:
   - Responda aos comentários de forma profissional
   - Faça as alterações solicitadas
   - Mantenha o PR atualizado com `main`

#### Revisão de Código

Quando seu PR for revisado:

- **Seja receptivo ao feedback**: Críticas construtivas ajudam a melhorar
- **Faça perguntas**: Se algo não estiver claro, pergunte
- **Itere rapidamente**: Responda e implemente feedback rapidamente
- **Mantenha discussões focadas**: Concentre-se no código, não em opiniões pessoais

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior
- Git
- Editor de código (recomendamos VS Code)

### Setup Inicial

```bash
# 1. Fork e clone
git clone https://github.com/seu-usuario/reflectio.git
cd reflectio

# 2. Adicione o upstream
git remote add upstream https://github.com/original-owner/reflectio.git

# 3. Instale dependências
npm install

# 4. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 5. Execute em desenvolvimento
npm run dev
```

### Ferramentas Recomendadas

**VS Code Extensions:**

- ESLint
- Prettier
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- GitLens

**Configurações do VS Code:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Áreas que Precisam de Ajuda

Estamos particularmente interessados em contribuições nas seguintes áreas:

- 🧪 **Testes**: Aumentar cobertura de testes
- 📱 **Responsividade**: Melhorar experiência mobile
- ♿ **Acessibilidade**: Melhorar a11y
- 🌐 **Internacionalização**: Adicionar suporte multi-idioma
- 📚 **Documentação**: Melhorar e expandir docs
- 🎨 **UI/UX**: Melhorias de interface e experiência
- ⚡ **Performance**: Otimizações de performance
- 🔒 **Segurança**: Identificar e corrigir vulnerabilidades

## Processo de Release

1. Mudanças são acumuladas no branch `main`
2. Quando pronto para release, criamos um branch `release/vX.Y.Z`
3. Testamos extensivamente
4. Atualizamos CHANGELOG.md
5. Merge para `main` e tag da versão
6. Deploy para produção

## Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Mudanças incompatíveis na API
- **MINOR** (0.1.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.1): Correções de bugs compatíveis

## Questões?

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/seu-usuario/reflectio/discussions)
- Entre em contacto via [email](mailto:seu-email@example.com)
- Consulte a [documentação](docs/)

## Reconhecimento

Todos os contribuidores serão reconhecidos no CHANGELOG e no README.

Obrigado por ajudar a tornar o Reflectio melhor! 🚀✨
