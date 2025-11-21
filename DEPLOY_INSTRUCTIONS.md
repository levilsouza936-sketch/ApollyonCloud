# 🚀 Guia de Deploy - Apollyon Cloud na Vercel

## 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no **"+"** no canto superior direito → **"New repository"**
3. Configure:
   - **Nome:** `apollyon-cloud` (ou o que preferir)
   - **Visibilidade:** Privado (recomendado para proteger credenciais)
   - **NÃO marque** nenhuma opção (README, .gitignore, licença)
4. Clique em **"Create repository"**
5. Copie a URL que aparece (algo como `https://github.com/SEU-USUARIO/apollyon-cloud.git`)

## 2️⃣ Fazer Push do Código

Execute no terminal (dentro da pasta do projeto):

```bash
git remote add origin https://github.com/SEU-USUARIO/apollyon-cloud.git
git branch -M main
git push -u origin main
```

## 3️⃣ Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub)
2. Clique em **"Add New..." → "Project"**
3. Importe o repositório `apollyon-cloud` que você acabou de criar
4. Configure as **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cclvjsmidrxdgsmoueby.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   MP_ACCESS_TOKEN=APP_USR-1908376782711319-061204-274fb...
   MP_WEBHOOK_SECRET=7cf4080d50c2d5a2368c53fc3034c70f...
   NEXT_PUBLIC_SITE_URL=https://SEU-PROJETO.vercel.app
   ```
5. Clique em **"Deploy"**

## 4️⃣ Configurar Webhook do Mercado Pago

Depois do deploy:
1. Copie a URL da Vercel (ex: `https://apollyon-cloud.vercel.app`)
2. Vá no [Painel do Mercado Pago](https://www.mercadopago.com.br/developers/panel/app)
3. Acesse **Webhooks** → **Configurar notificações**
4. Cole a URL: `https://SEU-PROJETO.vercel.app/api/webhook`
5. Selecione apenas o evento: **Pagamentos**
6. Salve

## 5️⃣ Configurar OAuth do Discord no Supabase

1. Vá no Supabase Dashboard → **Authentication** → **Providers** → **Discord**
2. Atualize o **Redirect URL** autorizado:
   - `https://SEU-PROJETO.vercel.app/auth/callback`
3. No Discord Developer Portal, atualize também o Redirect URI

---

**Pronto!** Seu projeto estará rodando em produção com HTTPS e o webhook funcionando perfeitamente! 🎉
