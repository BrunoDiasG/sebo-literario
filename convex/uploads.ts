import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./auth.config";

// Gerar URL para fazer upload
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.storage.generateUploadUrl();
  },
});

// Salvar informações do arquivo
export const saveUploadedFile = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const uploadId = await ctx.db.insert("uploads", {
      userId,
      storageId: args.storageId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      createdAt: Date.now(),
    });

    return uploadId;
  },
});

// Obter URL para download
export const getDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    try {
      return await ctx.storage.getUrl(args.storageId);
    } catch (error) {
      throw new Error("Arquivo não encontrado");
    }
  },
});

// Listar uploads do usuário
export const getUserUploads = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("uploads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Deletar upload
export const deleteUpload = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const upload = await ctx.db.get(args.uploadId);
    if (!upload) throw new Error("Upload não encontrado");
    if (upload.userId !== userId) throw new Error("Sem permissão");

    // Deletar arquivo do storage
    await ctx.storage.delete(upload.storageId);

    // Deletar registro do banco
    await ctx.db.delete(args.uploadId);
  },
});
