import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";
import { getUserId } from "./auth.config";

// Usuário atual
export const currentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
