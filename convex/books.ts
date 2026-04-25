import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./auth.config";

// Obter todos os livros do usuário autenticado
export const getBooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("books")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Adicionar um novo livro
export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    pdfStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const bookId = await ctx.db.insert("books", {
      userId,
      title: args.title,
      author: args.author,
      description: args.description || "",
      coverUrl: args.coverUrl || "",
      pdfStorageId: args.pdfStorageId || "",
      createdAt: Date.now(),
    });

    return bookId;
  },
});

// Remover um livro
export const removeBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Livro não encontrado");
    if (book.userId !== userId) throw new Error("Sem permissão para deletar");

    await ctx.db.delete(args.bookId);
  },
});

// Atualizar um livro
export const updateBook = mutation({
  args: {
    bookId: v.id("books"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Livro não encontrado");
    if (book.userId !== userId) throw new Error("Sem permissão para editar");

    await ctx.db.patch(args.bookId, {
      title: args.title !== undefined ? args.title : book.title,
      author: args.author !== undefined ? args.author : book.author,
      description: args.description !== undefined ? args.description : book.description,
      coverUrl: args.coverUrl !== undefined ? args.coverUrl : book.coverUrl,
    });
  },
});
