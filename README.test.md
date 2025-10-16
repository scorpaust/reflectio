# 🧪 Guia de Testes - Reflectio

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Testes Unitários](#testes-unitários)
- [Testes de Integração E2E](#testes-de-integração-e2e)
- [Coverage](#coverage)
- [CI/CD](#cicd)
- [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

Este projeto utiliza uma suíte de testes robusta com:

- **Jest** + **React Testing Library** para testes unitários e de integração
- **Playwright** para testes E2E (End-to-End)
- **Coverage automático** com thresholds configurados
- **Testes de acessibilidade** com @axe-core/playwright

### 📊 Estatísticas Atuais

- **107 testes unitários** passando ✅
- **100% coverage** nos componentes testados
- **Testes E2E** para fluxos críticos
- **Testes de acessibilidade** WCAG 2.1 AA

## ⚙️ Configuração

### Instalação

```bash
# Instalar dependências
npm install

# Instalar navegadores do Playwright (necessário para E2E)
npm run playwright:install
```

### Arquivos de Configuração

- `jest.config.ts` - Configuração do Jest
- `jest.setup.ts` - Setup global dos testes
- `playwright.config.ts` - Configuração do Playwright

## 🔬 Testes Unitários

### Executar Testes

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch (desenvolvimento)
npm run test:watch

# Rodar com coverage
npm run test:coverage

# Rodar para CI (com coverage e configurações otimizadas)
npm run test:ci
```

### Estrutura de Testes

```
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── lib/hooks/
    ├── useModeration.ts
    └── __tests__/
        └── useModeration.test.ts
```

### Componentes Testados

#### ✅ Componentes UI (100% coverage)
- `Button.tsx` - 24 testes
  - Variantes (primary, secondary, ghost, danger)
  - Tamanhos (sm, md, lg)
  - Estados (loading, disabled)
  - Interações e acessibilidade

- `Input.tsx` - 22 testes
  - Rendering e labels
  - Estados de erro
  - Interações do usuário
  - Validações e acessibilidade

#### ✅ Componentes de Autenticação (100% coverage)
- `LoginForm.tsx` - 20 testes
  - Login com email/senha
  - Login com Google OAuth
  - Validações de formulário
  - Estados de loading e erro
  - Console logging

#### ✅ Utilities (100% coverage)
- `utils.ts` - 19 testes
  - `cn()` - merge de classes
  - `formatDate()` - formatação de datas
  - `getInitials()` - extração de iniciais

#### ✅ Hooks (95.36% coverage)
- `useModeration.ts` - 22 testes
  - Moderação de texto
  - Moderação de áudio
  - Lógica de decisão (allow/block/warn/review)
  - Modos strict e autoBlock
  - Error handling

## 🌐 Testes de Integração E2E

### Executar Testes E2E

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar com UI interativa
npm run test:e2e:ui

# Rodar com navegador visível
npm run test:e2e:headed

# Debug de testes
npm run test:e2e:debug
```

### Testes E2E Implementados

#### 🔐 Fluxo de Autenticação (`e2e/auth.spec.ts`)
- ✅ Exibição correta da página de login
- ✅ Validação de campos obrigatórios
- ✅ Erro em credenciais inválidas
- ✅ Navegação para registro
- ✅ Acessibilidade WCAG 2.1 AA
- ✅ Checkbox "Lembrar-me"
- ✅ Estado de loading
- ✅ Link "Esqueceu a senha"
- ✅ Design responsivo (mobile, tablet)
- ✅ Navegação por teclado
- ✅ Submissão com Enter

#### 🏠 Página Inicial (`e2e/home.spec.ts`)
- ✅ Carregamento da homepage
- ✅ Acessibilidade
- ✅ Navegação para login
- ✅ Design responsivo
- ✅ Meta tags para SEO
- ✅ Performance (< 5s)

### Navegadores Testados

- ✅ Chrome Desktop
- ✅ Firefox Desktop
- ✅ Safari Desktop
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 📈 Coverage

### Thresholds Configurados

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Relatório de Coverage

Após rodar `npm run test:coverage`, o relatório HTML estará disponível em:
```
coverage/lcov-report/index.html
```

### Coverage Atual por Arquivo

| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| Button.tsx | 100% | 100% | 100% | 100% |
| Input.tsx | 100% | 100% | 100% | 100% |
| LoginForm.tsx | Alta cobertura | Alta cobertura | Alta cobertura | Alta cobertura |
| utils.ts | 100% | 100% | 100% | 100% |
| useModeration.ts | 95.36% | 78.57% | 100% | 95.36% |

## 🔄 CI/CD

### GitHub Actions

O projeto inclui workflow de CI/CD automatizado (`.github/workflows/tests.yml`):

#### Jobs Configurados:

1. **unit-tests**
   - Roda testes unitários com coverage
   - Upload para Codecov
   - Executa em PRs e pushes para main/develop

2. **e2e-tests**
   - Instala navegadores do Playwright
   - Roda testes E2E em todos os navegadores
   - Gera relatório HTML
   - Upload de artefatos (relatórios)

### Executar Localmente como no CI

```bash
# Simular ambiente de CI
CI=true npm run test:ci
CI=true npm run test:e2e
```

## 📝 Boas Práticas

### Escrevendo Testes

#### ✅ DO:

```typescript
// Use queries semânticas
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')

// Teste comportamento do usuário
await userEvent.click(button)
await userEvent.type(input, 'text')

// Use waitFor para operações assíncronas
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// Teste acessibilidade
expect(button).toHaveAttribute('aria-label', 'Close')
```

#### ❌ DON'T:

```typescript
// Evite selecionar por classes ou IDs
container.querySelector('.my-class')

// Evite testar detalhes de implementação
expect(component.state.value).toBe('test')

// Evite timeouts fixos
await new Promise(resolve => setTimeout(resolve, 1000))
```

### Organizando Testes

```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    beforeEach(() => {
      // Setup comum
    })

    it('should do something specific', () => {
      // Teste focado e descritivo
    })
  })
})
```

### Mocking

```typescript
// Mock de módulos
jest.mock('@/lib/supabase/client')

// Mock de funções
const mockFn = jest.fn()
mockFn.mockResolvedValue({ data: 'test' })
mockFn.mockRejectedValue(new Error('fail'))
```

## 🐛 Debugging

### Jest

```bash
# Debug específico teste
npm test -- --testNamePattern="should login successfully"

# Debug com Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright

```bash
# Mode debug interativo
npm run test:e2e:debug

# UI mode
npm run test:e2e:ui

# Ver traces
npx playwright show-trace trace.zip
```

## 🔍 Flaky Tests

### Identificação e Correção

1. **Timeouts**: Aumente timeouts para operações lentas
```typescript
await waitFor(() => {
  expect(element).toBeVisible()
}, { timeout: 10000 })
```

2. **Race Conditions**: Use `waitFor` e `waitForOptions`
```typescript
await page.waitForLoadState('networkidle')
```

3. **Dados Dinâmicos**: Mocke datas, IDs e dados aleatórios
```typescript
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-01-01'))
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 Próximos Passos

- [ ] Adicionar testes para componentes de feed
- [ ] Implementar testes de moderação E2E
- [ ] Adicionar testes de performance (Lighthouse)
- [ ] Configurar testes visuais de regressão
- [ ] Aumentar coverage para 90%+

---

**Mantido por:** Equipe Reflectio
**Última atualização:** 2025-10-15
