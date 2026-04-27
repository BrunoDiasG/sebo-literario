# 🔗 Integração Convex - Guia Rápido

## ✅ Como Configurar (Backend)

O Convex agora está configurado **via variáveis de ambiente**, não mais no frontend. Siga estes passos:

### 1️⃣ Obter URL do Convex

1. Acesse [dashboard.convex.dev](https://dashboard.convex.dev)
2. Encontre seu projeto (ex: `sebo-literario`)
3. Clique em **Deployment** ou **Settings**
4. Copie a URL (ex: `https://seu-projeto-123.convex.cloud`)

### 2️⃣ Configurar Localmente

Na **raiz do seu projeto**, edite o arquivo `.env`:

```env
VITE_CONVEX_URL=https://seu-projeto-123.convex.cloud
```

**Importante:** Este arquivo **NÃO é versionado** (está em `.gitignore`)

### 3️⃣ Configurar no Netlify (Deploy)

1. Vá em [app.netlify.com](https://app.netlify.com)
2. Selecione seu site
3. **Site settings** → **Build & deploy** → **Environment**
4. Clique em **Edit variables**
5. Adicione:
   - **Key:** `VITE_CONVEX_URL`
   - **Value:** `https://seu-projeto-123.convex.cloud`
6. Clique em **Save**
7. Faça um **redeploy manual** ou aguarde o próximo push

### 4️⃣ Testar

O Convex será inicializado automaticamente quando a página carregar. Verifique:

1. Abra **DevTools** (F12)
2. Vá em **Console**
3. Procure por: `✅ Convex inicializado com: https://seu-projeto...`

---

## 🚫 Erros Comuns

**❌ "Convex não está configurado"**
- Solução: Verifique se a variável `VITE_CONVEX_URL` está definida
- Recarregue a página após configurar

**❌ "Convex URL inválida"**
- Solução: Certifique-se que a URL inclui `.convex.cloud`
- Copie exatamente do Convex Dashboard

**❌ "ConvexHttpClient não definido"**
- Solução: A biblioteca do Convex não carregou
- Verifique a conexão e o console para erros

---

## 📝 Referência

- **Arquivo de Configuração:** `.env` (local, não commitado)
- **Arquivo de Exemplo:** `.env.example` (no repositório)
- **Variável de Ambiente:** `VITE_CONVEX_URL`
- **Dashboard:** https://dashboard.convex.dev

---

**Pronto!** Após configurar, seu app estará integrado com Convex! 🚀
