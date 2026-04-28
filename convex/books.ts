import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addBook = mutation({
  args: {
    userId: v.id("users"), // Agora recebe userId do frontend (do token)
    title: v.string(),
    author: v.string(),
    genre: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileData: v.string(), // Base64 por enquanto
  },
  async handler(ctx, args) {
    // Validar que o usuário existe
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Usuário não encontrado");

    // Criar livro com status "pending" (aguardando aprovação)
    const bookId = await ctx.db.insert("books", {
      userId: args.userId,
      title: args.title,
      author: args.author,
      genre: args.genre,
      description: args.description || "",
      pdfStorageId: args.fileData, // Armazenar base64 (TODO: migrar para storage)
      fileName: args.fileName,
      status: "pending", // Novo livro sempre começa em pending
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      _id: bookId,
      title: args.title,
      author: args.author,
      genre: args.genre,
      description: args.description,
      fileName: args.fileName,
      status: "pending",
      cover: "📖",
    };
  },
});

// Query: Obter livros aprovados (visíveis para usuários normais)
export const getApprovedBooks = query({
  async handler(ctx) {
    const books = await ctx.db
      .query("books")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    return books.map((b) => ({
      _id: b._id,
      title: b.title,
      author: b.author,
      genre: b.genre || "Desconhecido",
      description: b.description || "",
      fileName: b.fileName || "",
      fileData: b.pdfStorageId || "",
      userId: b.userId,
      cover: "📖",
    }));
  },
});

// Query: Obter livros do usuário (qualquer status)
export const getUserBooks = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const books = await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return books.map((b) => ({
      _id: b._id,
      title: b.title,
      author: b.author,
      genre: b.genre || "Desconhecido",
      description: b.description || "",
      fileName: b.fileName || "",
      fileData: b.pdfStorageId || "",
      status: b.status,
      cover: "📖",
    }));
  },
});

// Query: Obter livro específico
export const getBook = query({
  args: {
    bookId: v.id("books"),
  },
  async handler(ctx, args) {
    const book = await ctx.db.get(args.bookId);

    if (!book) throw new Error("Livro não encontrado");
    
    // Apenas mostrar se estiver aprovado ou usuário é o dono
    if (book.status !== "approved") {
      // TODO: Validar userId do usuário atual
    }

    return {
      _id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre || "Desconhecido",
      description: book.description || "",
      fileName: book.fileName || "",
      fileData: book.pdfStorageId || "",
      status: book.status,
      cover: "📖",
    };
  },
});

// Mutation: Deletar livro (apenas admin ou dono)
export const deleteBook = mutation({
  args: {
    bookId: v.id("books"),
    userId: v.id("users"), // Validar que é o dono
  },
  async handler(ctx, args) {
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Livro não encontrado");

    // Validar que é o dono ou admin
    if (book.userId !== args.userId) {
      throw new Error("Sem permissão para deletar este livro");
    }

    await ctx.db.delete(args.bookId);
    return { success: true };
  },
});

// ========== FUNÇÕES DE ADMIN ==========

// Query: Obter livros pendentes (para admin aprovar)
export const getPendingBooks = query({
  async handler(ctx) {
    const books = await ctx.db
      .query("books")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Enriquecer com dados do usuário que enviou
    const booksWithUser = await Promise.all(
      books.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        return {
          _id: b._id,
          title: b.title,
          author: b.author,
          genre: b.genre,
          description: b.description,
          fileName: b.fileName,
          fileData: b.pdfStorageId || "",
          status: b.status,
          createdAt: b.createdAt,
          userId: b.userId,
          userName: user?.name || "Desconhecido",
          cover: "📖",
        };
      })
    );

    return booksWithUser;
  },
});

// Mutation: Aprovar livro (admin only)
export const approveBook = mutation({
  args: {
    bookId: v.id("books"),
    adminUserId: v.id("users"),
  },
  async handler(ctx, args) {
    // Validar que é admin
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas admin pode aprovar livros");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Livro não encontrado");

    await ctx.db.patch(args.bookId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return { success: true, status: "approved" };
  },
});

// Mutation: Rejeitar livro (admin only)
export const rejectBook = mutation({
  args: {
    bookId: v.id("books"),
    adminUserId: v.id("users"),
    reason: v.string(),
  },
  async handler(ctx, args) {
    // Validar que é admin
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas admin pode rejeitar livros");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Livro não encontrado");

    await ctx.db.patch(args.bookId, {
      status: "rejected",
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });

    return { success: true, status: "rejected" };
  },
});
