// Configuração de autenticação para Convex
// com suporte para múltiplos provedores

export default {
  providers: [
    {
      domain: "https://accounts.google.com",
      applicationID: "your-app-id.apps.googleusercontent.com",
    },
  ],
};

// Funções helper para usar em queries e mutations
export async function getUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier || null;
}

export async function getCurrentUserId(ctx: any) {
  return await getUserId(ctx);
}
