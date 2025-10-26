# Configuração de Email para Contactos

## ✅ Opção 1: Mailjet (IMPLEMENTADO)

O sistema já está configurado para usar o Mailjet. Apenas precisa adicionar as credenciais:

### Variáveis de Ambiente (.env.local e .env.production):

```
MJ_APIKEY_PUBLIC=sua_chave_publica_mailjet
MJ_APIKEY_PRIVATE=sua_chave_privada_mailjet
```

### Como obter as credenciais:

1. Vai ao dashboard do Mailjet
2. Acede a "Account Settings" > "Master API Key & Sub API key management"
3. Copia a API Key (pública) e Secret Key (privada)
4. Adiciona às variáveis de ambiente

## Opção 2: Formspree (Alternativa)

1. Vai a https://formspree.io/
2. Cria uma conta gratuita
3. Cria um novo formulário
4. Configura o email de destino: `dinismiguelcosta@hotmail.com`
5. Copia o endpoint do formulário (algo como `https://formspree.io/f/xpzgkqyw`)

### Variáveis de Ambiente (.env.local e .env.production):

```
FORMSPREE_ENDPOINT=https://formspree.io/f/SEU_ID_AQUI
```

## Opção 2: EmailJS (Alternativa)

1. Vai a https://www.emailjs.com/
2. Cria uma conta gratuita
3. Configura um serviço de email (Gmail, Outlook, etc.)
4. Cria um template de email
5. Obtém as credenciais

### Variáveis de Ambiente:

```
EMAILJS_SERVICE_ID=seu_service_id
EMAILJS_TEMPLATE_ID=seu_template_id
EMAILJS_USER_ID=seu_user_id
```

## Opção 3: Resend (Profissional)

1. Vai a https://resend.com/
2. Cria uma conta
3. Verifica o domínio (ou usa o domínio de teste)
4. Obtém a API key

### Variáveis de Ambiente:

```
RESEND_API_KEY=re_sua_api_key_aqui
```

## Como Funciona

Quando alguém submete o formulário de contacto:

1. ✅ A mensagem é salva na base de dados Supabase
2. ✅ Um email é enviado automaticamente para `dinismiguelcosta@hotmail.com`
3. ✅ O email contém todos os detalhes da mensagem
4. ✅ Se houver anexo, o nome e tamanho são incluídos

## Recomendação

**Use o Formspree** - é o mais simples de configurar e funciona imediatamente. Apenas:

1. Cria conta no Formspree
2. Adiciona `FORMSPREE_ENDPOINT` às variáveis de ambiente
3. Pronto! Os emails começam a chegar automaticamente

## Teste

Depois de configurar, podes testar enviando uma mensagem através do formulário de contacto em `/contact`. Deves receber um email em poucos segundos.
