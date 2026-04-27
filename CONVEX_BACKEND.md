# Sebo Literario - Configuração Convex

## ✅ Status Atual

- ✅ Frontend completamente funcional com Convex
- ✅ Sem localStorage (usa sessionStorage apenas para sessão)
- ✅ URL do Convex configurada em `convex.config.js`
- ❌ **Faltam as funções de backend no Convex**

---

## 🔗 Funções Backend Necessárias

O app está chamando essas funções Convex que **ainda não existem**:

### Autenticação
```typescript
mutation users:registerUser(name, email, password) -> user
mutation users:loginUser(email, password) -> user
mutation users:updateProfile(name) -> user
```

### Livros
```typescript
mutation books:addBook(title, author, genre, description, fileName, fileData) -> book
query books:getUserBooks() -> [book]
query books:getBook(bookId) -> book
mutation books:deleteBook(bookId) -> void
```

---

## 📁 Arquivos Convex Existentes

- `convex/schema.ts` - Estrutura do banco (pronta)
- `convex/auth.config.ts` - Configuração de auth (vazia)
- `convex/users.ts` - Funções de usuário (vazia)
- `convex/books.ts` - Funções de livros (vazia)

---

## 🚀 O Que Fazer Agora

### 1️⃣ Implementar `convex/users.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    // Verificar se já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      throw new Error("Email já registrado");
    }
    
    // Criar novo usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: btoa(args.password), // Usar bcrypt em produção!
      createdAt: Date.now(),
    });
    
    return {
      id: userId,
      name: args.name,
      email: args.email,
    };
  },
});

export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user || user.passwordHash !== btoa(args.password)) {
      throw new Error("Email ou senha incorretos");
    }
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    // Obter usuário da sessão Convex
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    
    if (!email) throw new Error("Não autenticado");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) throw new Error("Usuário não encontrado");
    
    await ctx.db.patch(user._id, { name: args.name });
    
    return {
      id: user._id,
      name: args.name,
      email: user.email,
    };
  },
});
```

### 2️⃣ Implementar `convex/books.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    genre: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileData: v.string(), // Base64
  },
  async handler(ctx, args) {
    // Obter ID do usuário da sessão
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    
    if (!email) throw new Error("Não autenticado");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) throw new Error("Usuário não encontrado");
    
    // Criar livro
    const bookId = await ctx.db.insert("books", {
      userId: user._id,
      title: args.title,
      author: args.author,
      description: args.description,
      genre: args.genre,
      pdfStorageId: args.fileData, // Armazenar base64 ou usar storage real
      fileName: args.fileName,
      createdAt: Date.now(),
    });
    
    return {
      _id: bookId,
      title: args.title,
      author: args.author,
      genre: args.genre,
      description: args.description,
      fileName: args.fileName,
      fileData: args.fileData,
      cover: "📖",
    };
  },
});

export const getUserBooks = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    
    if (!email) throw new Error("Não autenticado");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) return [];
    
    const books = await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return books.map(b => ({
      _id: b._id,
      title: b.title,
      author: b.author,
      genre: b.genre,
      description: b.description,
      fileName: b.fileName,
      fileData: b.pdfStorageId, // Base64
      cover: "📖",
    }));
  },
});

export const getBook = query({
  args: {
    bookId: v.id("books"),
  },
  async handler(ctx, args) {
    const book = await ctx.db.get(args.bookId);
    
    if (!book) throw new Error("Livro não encontrado");
    
    return {
      _id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      fileName: book.fileName,
      fileData: book.pdfStorageId,
      cover: "📖",
    };
  },
});

export const deleteBook = mutation({
  args: {
    bookId: v.id("books"),
  },
  async handler(ctx, args) {
    await ctx.db.delete(args.bookId);
  },
});
```

---

## 📝 Próximas Steps

1. **Copiar o código acima** para os arquivos de backend
2. **Deploy do Convex:**
   ```bash
   npx convex deploy
   ```
3. **Testar no app:**
   - Cadastro novo usuário
   - Login
   - Adicionar livro
   - Ler livro

---

## ⚠️ Notas Importantes

- O código acima usa `btoa()` para senha (NÃO USE EM PRODUÇÃO - use bcrypt)
- O `fileData` em base64 funciona para teste, mas em produção use Convex Storage
- A autenticação usa `ctx.auth.getUserIdentity()` - configure OAuth/Auth0 se necessário
- Para desenvolvimento, use `npx convex dev` para testar localmente

