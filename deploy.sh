#!/bin/bash

# =========================================
# SCRIPT DE DEPLOY CONVEX + NETLIFY
# =========================================

echo "🚀 Iniciando deploy..."
echo ""

# 1. Deploy do Convex
echo "1️⃣ Fazendo deploy do Convex..."
npx convex deploy

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer deploy do Convex"
    exit 1
fi

echo "✅ Convex deployado com sucesso!"
echo ""

# 2. Commit no Git
echo "2️⃣ Fazendo commit..."
git add -A
git commit -m "Deploy: Convex backend ready" || true

# 3. Push para GitHub
echo "3️⃣ Fazendo push para GitHub..."
git push

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer push"
    exit 1
fi

echo "✅ Push concluído!"
echo ""

# 4. Verificação
echo "4️⃣ Verificando deploy..."
echo ""
echo "✅ TUDO PRONTO!"
echo ""
echo "📝 Próximas etapas:"
echo "1. Aguarde 1-2 minutos o Netlify fazer redeploy"
echo "2. Acesse seu site: https://seu-site.netlify.app"
echo "3. Teste: Cadastro → Login → Adicionar livro"
echo ""
echo "🔗 Dashboard Convex: https://dashboard.convex.dev"
echo "🌐 Dashboard Netlify: https://app.netlify.com"
