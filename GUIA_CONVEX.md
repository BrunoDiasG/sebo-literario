# 🚀 Guia Completo: Configurando Convex no Sebo

## O que é Convex?

Convex é um **backend moderno serverless** que combina:
- **Banco de dados em tempo real** (tipo Firebase, mas melhor)
- **Autenticação integrada** (não precisa de JWT manual)
- **Armazenamento de arquivos** (para PDFs)
- **Funções serverless** (executa no backend sem servidor para gerenciar)

## ✅ Pré-requisitos

1. **Node.js 18+** - [Baixar aqui](https://nodejs.org)
2. **Conta Convex** - [Criar aqui](https://www.convex.dev) (você já tem!)
3. **Git** (opcional, mas recomendado)

## 📦 Passo 1: Instalar Node.js

1. Acesse https://nodejs.org
2. Download a versão LTS (Long Term Support)
3. Execute o instalador e clique "Next" até terminar
4. Abra um novo terminal PowerShell e verifique:
```bash
node --version
npm --version
```

## 🔧 Passo 2: Inicializar Convex no Projeto

Depois que Node.js estiver instalado, execute:

```bash
cd "c:\Users\Usuario\Desktop\sebo literario"
npm install
npm install convex next
npx convex init
```

O `npx convex init` vai:
- Conectar com sua conta Convex
- Criar a pasta `convex/`
- Criar `convex.json`

## 📊 Passo 3: Arquivos que Você Vai Criar

Após `convex init`, você vai ter essa estrutura:

```
convex/
├── _generated/
│   └── api.d.ts         # Tipos gerados automaticamente
├── schema.ts            # Definição das tabelas
├── auth.config.ts       # Configuração de autenticação
├── books.ts             # Funções para gerenciar livros
├── users.ts             # Funções para gerenciar usuários
└── uploads.ts           # Funções para upload de PDFs
```

## 🗄️ Passo 4: Schema (Estrutura do Banco de Dados)

No arquivo `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    pdfUrl: v.string(),
    coverUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  uploads: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

## 🔐 Passo 5: Autenticação

No arquivo `convex/auth.config.ts`:

```typescript
import { defineAuth } from "convex/server";
import { password } from "@convex-dev/auth/server";

export const { auth, signOut } = defineAuth({
  providers: [password.with({ id: "password" })],
  callbacks: {
    async onSignIn(args) {
      // Hook executado após login bem-sucedido
      return true;
    },
  },
});
```

## 📚 Passo 6: Funções para Livros

No arquivo `convex/books.ts`:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth.config";

export const getBooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    pdfUrl: v.string(),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    return await ctx.db.insert("books", {
      userId,
      title: args.title,
      author: args.author,
      description: args.description || "",
      pdfUrl: args.pdfUrl,
      coverUrl: args.coverUrl || "",
      createdAt: Date.now(),
    });
  },
});

export const removeBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    const book = await ctx.db.get(args.bookId);
    if (book?.userId !== userId) throw new Error("Sem permissão");

    await ctx.db.delete(args.bookId);
  },
});
```

## 🔑 Passo 7: Funções de Autenticação

No arquivo `convex/auth.ts`:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth.config";

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se usuário já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) throw new Error("Email já registrado");

    // Hash da senha (use bcrypt em produção)
    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("Usuário não encontrado");

    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) throw new Error("Senha incorreta");

    return { userId: user._id, email: user.email, name: user.name };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});
```

## 📤 Passo 8: Upload de PDFs

No arquivo `convex/uploads.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth.config";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUploadedFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    return await ctx.db.insert("uploads", {
      userId,
      storageId: args.storageId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      createdAt: Date.now(),
    });
  },
});

export const getDownloadUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## 🌐 Passo 9: Integração com Frontend

No seu `script.js`, você va usar o cliente Convex:

```javascript
import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const client = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

// Registrar
async function registerUser(email, password, name) {
  try {
    const userId = await client.mutation(api.auth.signUp, {
      email,
      password,
      name,
    });
    return userId;
  } catch (error) {
    console.error("Erro no registro:", error);
  }
}

// Fazer Login
async function loginUser(email, password) {
  try {
    const user = await client.mutation(api.auth.signIn, {
      email,
      password,
    });
    localStorage.setItem("userId", user.userId);
    return user;
  } catch (error) {
    console.error("Erro no login:", error);
  }
}

// Obter Livros
async function loadBooks() {
  try {
    const books = await client.query(api.books.getBooks);
    return books;
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}

// Adicionar Livro
async function addNewBook(title, author, description, pdfUrl, coverUrl) {
  try {
    const bookId = await client.mutation(api.books.addBook, {
      title,
      author,
      description,
      pdfUrl,
      coverUrl,
    });
    return bookId;
  } catch (error) {
    console.error("Erro ao adicionar livro:", error);
  }
}

// Deletar Livro
async function deleteBook(bookId) {
  try {
    await client.mutation(api.books.removeBook, { bookId });
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
  }
}

// Upload PDF
async function uploadPDF(file) {
  try {
    const uploadUrl = await client.mutation(api.uploads.generateUploadUrl);
    
    const result = await fetch(uploadUrl, {
      method: "POST",
      body: file,
    });

    const { storageId } = await result.json();
    return storageId;
  } catch (error) {
    console.error("Erro no upload:", error);
  }
}
```

## 🚀 Passo 10: Executar o Projeto

```bash
# Terminal 1: Rodar o servidor Convex
npx convex dev

# Terminal 2: Servir o frontend (se usando vite)
npm run dev
```

## 📝 Resumo das Vantagens

| Antes (localStorage) | Depois (Convex) |
|---|---|
| Dados locais apenas | Sincronizado na nuvem |
| Sem segurança real | Autenticação segura |
| Sem compartilhamento | PDFs seguros na nuvem |
| Sem backup | Backup automático |

## ❓ Próximos Passos

1. Instale Node.js
2. Execute `npm install` no projeto
3. Execute `npx convex init`
4. Crie os arquivos acima
5. Execute `npx convex dev`
6. Teste as funções!

Precisa de ajuda em algum passo? Me avisa! 🚀
