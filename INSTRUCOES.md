# 🚀 Guia de Instalação - Apollyon Cloud

Bem-vindo ao projeto **Apollyon Cloud**! Este guia foi feito para você configurar tudo do zero, com foco total em segurança.

## 1. Configuração do Banco de Dados (Supabase)

✅ **JÁ REALIZADO:** Eu usei as ferramentas automáticas para configurar seu banco de dados.
*   As tabelas (`profiles`, `products`, `orders`, `subscriptions`) já foram criadas.
*   As regras de segurança (RLS) já estão ativas.
*   Os produtos iniciais já foram inseridos.

Você não precisa rodar nenhum script SQL manualmente! 🎉

## 2. Configuração de Autenticação (Discord)

1.  No painel do Supabase, vá em **Authentication** > **Providers**.
2.  Habilite o **Discord**.
3.  Você precisará do `Client ID` e `Client Secret` do Discord.
    *   Vá no [Discord Developer Portal](https://discord.com/developers/applications).
    *   Crie uma "New Application".
    *   Vá em "OAuth2" no menu lateral.
    *   Adicione a URL de Callback do Supabase (está na tela de configuração do provider no Supabase) em "Redirects".
    *   Copie o ID e Secret e cole no Supabase.
4.  **IMPORTANTE:** Em **Authentication** > **URL Configuration**, certifique-se de que `Site URL` é `http://localhost:3000` (para testes locais).

## 3. Configuração das Variáveis de Ambiente

1.  Na pasta do projeto, encontre o arquivo `.env.local.example`.
2.  Renomeie ele para `.env.local` (apenas isso, tire o .example).
3.  Abra o arquivo e preencha as chaves conforme os comentários explicam.
    *   **Supabase URL & Anon Key:** Pegue em Project Settings > API.
    *   **Mercado Pago:** Pegue suas credenciais de teste no painel do Mercado Pago.

## 4. Instalação e Execução

Abra seu terminal na pasta do projeto e rode:

```bash
# 1. Instalar todas as dependências
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev
```

Agora acesse `http://localhost:3000` no seu navegador.

## 🛡️ Notas de Segurança (AppSec)

*   **RLS (Row Level Security):** Já está ativado. Usuários mal intencionados não conseguem ler dados de outros usuários, mesmo se tiverem a chave pública.
*   **Chaves:** A chave `service_role` (que tem poder total) **NUNCA** deve ir para o `.env.local` ou para o GitHub. Se precisar dela para scripts de administração, use um arquivo separado não versionado.
*   **Git:** O arquivo `.gitignore` já está configurado para impedir que você suba suas senhas sem querer.

## 🛠️ Próximos Passos

*   Teste o login com Discord.
*   Tente "comprar" um plano (use cartões de teste do Mercado Pago).
*   Verifique se o status muda no Dashboard.

Boa sorte com a Apollyon Cloud! 🎮☁️
