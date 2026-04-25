# ❓ FAQ - Convex & Sebo

## Perguntas Frequentes

---

### 💰 P: Convex é gratuito?

**R:** Sim! Convex tem um plano gratuito muito generoso:
- 100 GB de armazenamento
- 1 GB de uploads por mês
- Acesso ilimitado
- Sem cartão de crédito necessário

Depois cresce conforme você usa. Perfeito para começar!

---

### 🔒 P: Como as senhas são armazenadas?

**R:** O Convex Auth usa **bcrypt** (padrão de indústria) para hash de senhas:
1. Usuário entra com email/senha
2. Senha é feita hash no servidor
3. Hash é armazenado (não a senha original)
4. Login: compara hash

**Você NUNCA** vê a senha em texto plano. É seguro!

---

### 📱 P: Posso usar no celular?

**R:** Sim! O Convex funciona em qualquer dispositivo com:
- Navegador web
- Conexão com internet

Você pode deixar como PWA (Progressive Web App) para funcionar offline também!

---

### 🌐 P: Como funciona o upload de PDF?

**R:** Fluxo de upload:
```
1. Usuário escolhe arquivo (PDF)
2. Pede URL de upload ao Convex
3. Faz upload direto (sem passar por servidor seu)
4. Recebe storageId do arquivo
5. Salva storageId no banco de dados
6. Para ler: pede URL do Convex passando storageId
```

**Vantagem:** Arquivos vão direto para Convex, seu servidor não fica pesado!

---

### 🔄 P: E se o usuário perder a conexão?

**R:** Depende se você implementar sincronização:

**Sem sincronização:**
- Usuário vê dados em cache
- Ao reconectar, sincroniza

**Com Convex Sync (recomendado):**
- Dados sempre sincronizados
- Funciona offline com cache automático
- Super rápido!

---

### 👥 P: Vários usuários podem ter o mesmo email?

**R:** Não! No schema criamos um **índice único**:
```typescript
users: defineTable({
  email: v.string(),
  // ...
}).index("by_email", ["email"])
```

Se tentar registrar com email existente, vai dar erro:
```
Error: Email já registrado
```

---

### 🗑️ P: Como deletar dados de um usuário?

**R:** Adicione esta função em `convex/books.ts`:

```typescript
export const deleteAllUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    // Deletar todos os livros
    const books = await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    for (const book of books) {
      await ctx.db.delete(book._id);
    }

    // Deletar todos uploads
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    for (const upload of uploads) {
      await ctx.storage.delete(upload.storageId);
      await ctx.db.delete(upload._id);
    }

    // Deletar usuário
    await ctx.db.delete(userId);
  },
});
```

---

### 🔐 P: Posso ter usuários admin?

**R:** Sim! Adicione um campo `role` no schema:

```typescript
users: defineTable({
  email: v.string(),
  name: v.string(),
  passwordHash: v.string(),
  role: v.union(v.literal("user"), v.literal("admin")),
  createdAt: v.number(),
}).index("by_email", ["email"]),
```

Depois crie funções que verificam `role`:

```typescript
export const deleteBookAsAdmin = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = await ctx.db.get(userId);
    
    if (user.role !== "admin") {
      throw new Error("Apenas admin pode fazer isso");
    }

    const book = await ctx.db.get(args.bookId);
    await ctx.db.delete(args.bookId);
  },
});
```

---

### ⚡ P: Convex é rápido?

**R:** Sim! Dados são servidos de datacenters globais:
- Latência **< 100ms** geralmente
- Queries em tempo real
- Sincronização automática
- Cache no cliente

Sua app vai ficar **muito rápida**!

---

### 🚀 P: Como faço deploy para produção?

**R:** Deploy é feito automaticamente!

1. **Frontend:** Deploy em Vercel/Netlify (arquivo `index.html` + assets)
2. **Backend:** Convex cuida sozinho (não precisa fazer nada!)

Exemplo com Vercel:
```bash
npm install -g vercel
vercel login
vercel deploy
```

Pronto! Seu site está no ar! 🎉

---

### 🔗 P: Posso usar Convex com React/Vue/Angular?

**R:** Sim! Convex funciona com:
- ✅ React (recomendado)
- ✅ Vue
- ✅ Svelte
- ✅ Angular
- ✅ Next.js
- ✅ Vanilla JS (seu caso!)

Todas as funções neste guia funcionam com vanilla JS!

---

### 💾 P: Meus dados estão seguros?

**R:** Sim! Convex tem:
- 🔐 Encriptação em trânsito (SSL/TLS)
- 🔐 Encriptação em repouso (AES-256)
- 🔐 Backup automático
- 🔐 Isolamento de dados por usuário
- 🔐 GDPR compliant

---

### 📊 P: Como ver meus dados no painel Convex?

**R:** Durante `npx convex dev`, acesse:
```
http://localhost:3210
```

Lá você vê:
- 📋 Todos os documentos
- 📈 Estatísticas de uso
- 🔍 Logs de erros
- 👥 Usuários

---

### 🛠️ P: Como fazer queries mais complexas?

**R:** Exemplos de queries avançadas:

```typescript
// Query com filtro
export const getBooksByAuthor = query({
  args: { author: v.string() },
  handler: async (ctx, args) => {
    const books = await ctx.db
      .query("books")
      .filter((q) => q.eq(q.field("author"), args.author))
      .collect();
    return books;
  },
});

// Query com ordenação
export const getNewestBooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    return await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10); // Top 10 mais recentes
  },
});

// Query com busca de texto
export const searchBooks = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const books = await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Filtro no cliente (ou use full-text search no Convex)
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(args.query.toLowerCase()) ||
        book.author.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
```

---

### 🎨 P: Posso customizar o design?

**R:** Claro! Este guia é só sobre backend. Design é todo seu:
- Use Bootstrap (você já usa!)
- Use Tailwind
- Use CSS custom
- Use qualquer framework

O Convex só fornece os dados!

---

### 📞 P: Onde encontro ajuda?

**R:** Recursos:
- 📖 [Docs Convex](https://docs.convex.dev) - Documentação oficial
- 💬 [Discord Convex](https://discord.gg/convex) - Comunidade ativa
- 🐛 [GitHub Issues](https://github.com/get-convex/convex-js) - Reportar bugs
- 📧 [Support](https://support.convex.dev) - Suporte oficial

---

### ❌ P: Deu erro "VITE_CONVEX_URL"?

**R:** Seu `.env.local` não foi criado. Soluções:

1. **Opção A:** Execute novamente `npx convex init`

2. **Opção B:** Crie `.env.local` manualmente na raiz:
```
VITE_CONVEX_URL=https://seu-project.convex.cloud
```

(Você acha a URL no painel Convex ou ao rodar `npx convex dev`)

---

### 🚨 P: Posso ter certeza que meu código é seguro?

**R:** Boas práticas:

1. **Sempre valide no servidor:**
   ```typescript
   // ✅ Bom
   export const deleteBook = mutation({
     args: { bookId: v.id("books") },
     handler: async (ctx, args) => {
       const userId = await auth.getUserId(ctx);
       const book = await ctx.db.get(args.bookId);
       
       // Verificar se pertence ao usuário
       if (book.userId !== userId) {
         throw new Error("Sem permissão");
       }
       
       await ctx.db.delete(args.bookId);
     },
   });
   
   // ❌ Ruim (não faz no servidor)
   // await deleteBook(bookId); // inseguro!
   ```

2. **Nunca confie no cliente**

3. **Sempre verifique autenticação**

---

## 🎓 Resumo

| Dúvida | Resposta Rápida |
|--------|-----------------|
| Grátis? | Sim! Plano gratuito generoso |
| Rápido? | Sim! < 100ms latência |
| Seguro? | Sim! Encriptação + Backup |
| Fácil? | Sim! Configuração em 10 min |
| Escalável? | Sim! Serverless cresce automático |

---

## 💡 Dica Final

Convex é perfeito para seu projeto porque:
- Você já tem HTML/CSS/JS pronto
- Convex adiciona backend **sem complicação**
- Você ganha autenticação + banco de dados em minutos
- Escalável para milhões de usuários

**Não use if/else para gerenciar dados locais mais!** 🎉

---

Qualquer dúvida fora daqui, me manda! 💬
