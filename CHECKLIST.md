# ✅ Checklist: GitHub + Netlify Deploy

Siga este checklist passo a passo para subir seu código no GitHub e fazer deploy no Netlify.

## 📥 Pré-requisitos

- [ ] Git instalado (https://git-scm.com/download/win)
- [ ] Conta GitHub criada (https://github.com/signup)
- [ ] Conta Netlify criada (https://netlify.com)

## 1️⃣ Configurar Git Localmente

```powershell
# Abra PowerShell/CMD na pasta do projeto
cd "c:\Users\Usuario\Desktop\sebo literario"

# Configure suas credenciais (importante!)
git config user.name "Seu Nome"
git config user.email "seu-email@gmail.com"

# Verificar se está tudo certo
git config --list
```

- [ ] Git configurado com seu nome e email

## 2️⃣ Preparar o Repositório Local

```powershell
# Inicializar git
git init

# Ver o status
git status
```

- [ ] `.gitignore` está criado (✅ já feito!)
- [ ] `netlify.toml` está criado (✅ já feito!)
- [ ] Nenhum arquivo sensível será commitado

## 3️⃣ Fazer o Primeiro Commit

```powershell
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer o commit
git commit -m "Initial commit: Sebo Literario PWA"
```

- [ ] Primeiro commit feito com sucesso

## 4️⃣ Criar Repositório no GitHub

1. Vá em https://github.com/new
2. Preencha:
   - **Repository name**: `sebo-literario`
   - **Description**: `Biblioteca Digital com Convex`
   - **Visibilidade**: Public (importante para Netlify)
   - **NÃO inicialize** com README/gitignore
3. Clique em "Create repository"
4. Copie os comandos para um repo existente

- [ ] Repositório criado no GitHub

## 5️⃣ Conectar Repositório Local ao GitHub

```powershell
# Renomear branch para main (se necessário)
git branch -M main

# Adicionar origem remota (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/sebo-literario.git

# Fazer push para o GitHub
git push -u origin main
```

**Se pedir autenticação:**
1. Vá em https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Selecione `repo` (acesso completo)
4. Clique "Generate token"
5. **Copie o token** (aparece uma única vez!)
6. Cole no terminal quando pedir senha

- [ ] Código enviado para o GitHub
- [ ] Você consegue acessar https://github.com/SEU-USUARIO/sebo-literario

## 6️⃣ Deploy no Netlify

### 6.1 Conectar GitHub ao Netlify

1. Vá em https://app.netlify.com
2. Clique em "Add new site"
3. Selecione "Import an existing project"
4. Clique em "GitHub"
5. Clique em "Authorize Netlify"
6. Selecione o repositório `sebo-literario`

- [ ] Netlify conectado ao seu repositório GitHub

### 6.2 Configurar o Build

Na tela de configuração, você verá:

**Build command:**
```
npm run build
```
(ou deixe em branco se não houver)

**Publish directory:**
```
.
```

**Environment variables:**
Adicione (opcional, se quiser usar em produção):
```
VITE_CONVEX_URL=https://seu-projeto.convex.cloud
```

- [ ] Build configurado
- [ ] Diretório de publicação é `.` (raiz do projeto)
- [ ] Variáveis de ambiente configuradas (opcional)

### 6.3 Deploy!

1. Clique em "Deploy site"
2. Espere 1-2 minutos
3. Você receberá uma URL como: `https://seu-nome-xxxx.netlify.app`

- [ ] Deploy concluído com sucesso
- [ ] Site está online em sua URL do Netlify

## 7️⃣ Testar o Site

1. Clique no link fornecido pelo Netlify
2. Teste as funcionalidades:
   - [ ] Página carrega normalmente
   - [ ] Login/Registro funciona
   - [ ] Interface está responsiva
   - [ ] Botão de Configurações existe

## 8️⃣ Auto-Deploy Futuro

Agora, toda vez que você fizer:

```powershell
git add .
git commit -m "Sua mudança"
git push
```

O **Netlify automaticamente**:
1. Detecta o push no GitHub
2. Executa o build
3. Faz deploy da nova versão ✨

Você pode acompanhar em: https://app.netlify.com

---

## 🆘 Troubleshooting

### ❌ "fatal: not a git repository"
```powershell
git init
```

### ❌ "fatal: could not read Username"
Use um **Personal Access Token** em vez de senha

### ❌ "Build failed"
Vá em https://app.netlify.com → seu site → Deploy logs para ver o erro

### ❌ "Site appears blank"
- Verifique se `index.html` está na raiz
- Confira o publish directory (deve ser `.`)

### ❌ "App não conecta ao Convex"
Configure a URL no app:
1. Clique em **⚙️ Configurações**
2. Cole a URL do Convex
3. Clique em Salvar

---

## 📝 Próximos Passos

Após deploy bem-sucedido:

1. **Custom Domain** (opcional):
   - No Netlify, vá em "Domain settings"
   - Conecte seu domínio próprio

2. **SSL Automático**:
   - Netlify fornece HTTPS gratuito ✨

3. **Variáveis de Ambiente**:
   - Configure no Netlify se usar APIs privadas

4. **Git Workflow**:
   - Faça branches para novas features
   - Use pull requests antes de fazer merge

---

**Dúvidas?** Leia os guias detalhados:
- [GITHUB_NETLIFY_SETUP.md](./GITHUB_NETLIFY_SETUP.md)
- [CONVEX_SETUP.md](./CONVEX_SETUP.md)

Boa sorte! 🚀
