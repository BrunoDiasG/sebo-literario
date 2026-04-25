# 🔧 Configuração Rápida - Convex Database

O projeto agora está **conectado** e pronto para usar o Convex! Aqui está como configurar:

## ⚡ 3 Passos Rápidos

### 1️⃣ Obter a URL do Convex

```bash
# No terminal, dentro da pasta do projeto, execute:
npx convex dev
```

Isso vai:
- Fazer login na sua conta Convex
- Criar/conectar ao projeto "sebo-literario"
- **Exibir a URL de deployment** (algo como `https://seu-projeto-12345.convex.cloud`)

### 2️⃣ Copiar a URL

Quando o comando `npx convex dev` rodar, você verá algo assim:

```
✓ Created .env.local
  Deployment URL: https://seu-projeto-12345.convex.cloud
```

**Copie essa URL** (a parte com `https://seu-projeto-...`)

### 3️⃣ Configurar no App

1. Abra o app no navegador
2. Clique em **⚙️ Config** (botão de Configurações)
3. Cole a URL no campo "URL do Projeto Convex"
4. Clique em **Salvar URL do Convex**

✅ **Pronto!** O app agora está sincronizado com seu banco de dados Convex.

---

## 📱 O que funciona agora:

- ✅ Upload de PDFs para o servidor Convex
- ✅ Armazenamento de livros no banco de dados
- ✅ Sincronização entre dispositivos
- ✅ Gestão de usuários com autenticação real

## 🆘 Se algo não funcionar:

1. **"ConvexHttpClient not found"**: Verifique se a biblioteca Convex está carregada no navegador
   - Verifique se o script do Convex foi adicionado ao HTML (linha ~275)

2. **"Erro ao conectar"**: Verifique se:
   - A URL está correta (deve ter `.convex.cloud` no final)
   - Você executou `npx convex dev` com sucesso
   - O projeto está ativo no dashboard Convex

3. **Erro ao fazer upload**: 
   - Certifique-se de estar logado
   - Confira se a URL do Convex está configurada

## 📚 Para entender melhor:

- [Dashboard Convex](https://dashboard.convex.dev) - Veja seus dados em tempo real
- [Documentação Convex](https://docs.convex.dev) - Aprenda mais sobre o Convex
- Arquivos de configuração: `convex/` - Contém a lógica do servidor

---

**Dúvidas?** Verifique o console do navegador (F12) para mensagens de erro detalhadas!
