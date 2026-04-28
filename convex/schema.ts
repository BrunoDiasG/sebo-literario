import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de usuários
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(), // bcrypt hash (seguro)
    role: v.string(), // "user" ou "admin"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Tabela de livros
  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    author: v.string(),
    genre: v.string(),
    description: v.optional(v.string()),
    fileName: v.optional(v.string()),
    pdfStorageId: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    status: v.string(), // "pending", "approved", "rejected"
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  // Tabela de uploads
  uploads: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Tabela de favoritos
  favorites: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_bookId", ["bookId"]),

  // Tabela de histórico de leitura
  readingHistory: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    pagesRead: v.number(),
    totalPages: v.optional(v.number()),
    lastReadAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_bookId", ["bookId"]),

  // Tabela de configurações do usuário
  userSettings: defineTable({
    userId: v.id("users"),
    theme: v.string(), // "light" ou "dark"
    fontSize: v.number(), // pixels
    language: v.string(), // "pt-BR" ou "en"
    notifications: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
