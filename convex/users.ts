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
      passwordHash: btoa(args.password),
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
    // Para desenvolvimento, buscar qualquer usuário
    // Em produção, usar ctx.auth.getUserIdentity()
    const user = await ctx.db
      .query("users")
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
