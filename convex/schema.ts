import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de usuários
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
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
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Tabela de uploads
  uploads: defineTable({
    userId: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
