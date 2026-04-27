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
    // Para desenvolvimento, buscar primeiro usuário
    const user = await ctx.db
      .query("users")
      .first();
    
    if (!user) throw new Error("Nenhum usuário encontrado");
    
    // Criar livro
    const bookId = await ctx.db.insert("books", {
      userId: user._id,
      title: args.title,
      author: args.author,
      description: args.description || "",
      pdfStorageId: args.fileData, // Armazenar base64
      fileName: args.fileName,
      genre: args.genre,
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
    // Para desenvolvimento, buscar primeiro usuário
    const user = await ctx.db
      .query("users")
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
      genre: b.genre || "Desconhecido",
      description: b.description || "",
      fileName: b.fileName || "",
      fileData: b.pdfStorageId || "",
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
      genre: book.genre || "Desconhecido",
      description: book.description || "",
      fileName: book.fileName || "",
      fileData: book.pdfStorageId || "",
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
