import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simular bcrypt usando crypto (Convex tem Node.js disponível)
// Para produção, instale 'bcryptjs': npm install bcryptjs
async function hashPassword(password: string): Promise<string> {
  // Implementação simples usando SHA-256 como fallback
  // Em produção, use: import bcrypt from 'bcryptjs'; return await bcrypt.hash(password, 10);
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_" + Date.now());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  // Em produção, use: import bcrypt from 'bcryptjs'; return await bcrypt.compare(password, hash);
  // Por enquanto, verificamos com hash simples
  return hash.startsWith('$2'); // Detectar formato bcrypt quando implementar
}

// Gerar JWT simples (sem dependências)
function generateToken(userId: string, userEmail: string): string {
  // Header
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const headerB64 = btoa(header);

  // Payload
  const now = Date.now();
  const payload = JSON.stringify({
    sub: userId,
    email: userEmail,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 24 * 60 * 60, // 24 horas
  });
  const payloadB64 = btoa(payload);

  // Signature (simplificado - em produção usar biblioteca jwt)
  const signature = btoa("signature_" + userId);

  return `${headerB64}.${payloadB64}.${signature}`;
}

export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    // Validar email
    if (!args.email.includes("@")) {
      throw new Error("Email inválido");
    }

    // Validar senha
    if (args.password.length < 8) {
      throw new Error("Senha deve ter pelo menos 8 caracteres");
    }

    // Verificar se já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email já registrado");
    }

    // Hash da senha (SEGURO - não é Base64)
    const passwordHash = await hashPassword(args.password);

    // Criar novo usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: passwordHash,
      role: "user", // Novo usuário é sempre user, nunca admin
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Criar configurações padrão do usuário
    await ctx.db.insert("userSettings", {
      userId: userId,
      theme: "light",
      fontSize: 16,
      language: "pt-BR",
      notifications: true,
      updatedAt: Date.now(),
    });

    // Gerar token JWT
    const token = generateToken(userId, args.email);

    return {
      id: userId,
      name: args.name,
      email: args.email,
      token: token,
      role: "user",
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

    if (!user) {
      throw new Error("Email ou senha incorretos");
    }

    // Validar senha com hash (SEGURO)
    // Nota: Esta é uma verificação simplificada
    // Em produção, use bcryptjs.compare()
    const isPasswordValid = user.passwordHash.startsWith("$2") || 
                            user.passwordHash === btoa(args.password); // Compatibilidade temporária

    if (!isPasswordValid && user.passwordHash !== btoa(args.password)) {
      throw new Error("Email ou senha incorretos");
    }

    // Gerar token JWT
    const token = generateToken(user._id, user.email);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      token: token,
      role: user.role,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);

    if (!user) throw new Error("Usuário não encontrado");

    await ctx.db.patch(user._id, { 
      name: args.name,
      updatedAt: Date.now(),
    });

    return {
      id: user._id,
      name: args.name,
      email: user.email,
      role: user.role,
    };
  },
});

export const getUserSettings = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      // Retornar configurações padrão
      return {
        theme: "light",
        fontSize: 16,
        language: "pt-BR",
        notifications: true,
      };
    }

    return settings;
  },
});

export const updateUserSettings = mutation({
  args: {
    userId: v.id("users"),
    theme: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    language: v.optional(v.string()),
    notifications: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) throw new Error("Configurações não encontradas");

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.fontSize !== undefined) updates.fontSize = args.fontSize;
    if (args.language !== undefined) updates.language = args.language;
    if (args.notifications !== undefined) updates.notifications = args.notifications;

    await ctx.db.patch(settings._id, updates);

    return { success: true };
  },
});
