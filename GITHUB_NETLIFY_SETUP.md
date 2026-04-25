# 📦 Guia: Subir Código no GitHub e Deploy no Netlify

## ⚙️ Pré-requisitos

### 1. Instalar Git
- Baixe em: https://git-scm.com/download/win
- Instale com as opções padrão
- Reinicie o terminal PowerShell/CMD após instalar

### 2. Criar Conta GitHub (se não tiver)
- Vá em https://github.com/signup
- Crie uma conta com email

### 3. Criar Conta Netlify (se não tiver)
- Vá em https://netlify.com
- Clique em "Sign up" e conecte com sua conta GitHub

---

## 🚀 Passo 1: Preparar o Repositório Local

### 1.1 Abra o PowerShell/CMD na pasta do projeto

```powershell
cd "c:\Users\Usuario\Desktop\sebo literario"
```

### 1.2 Inicializar o Git

```powershell
git init
git config user.name "Seu Nome"
git config user.email "seu-email@gmail.com"
```

### 1.3 Criar arquivo .gitignore

Crie um arquivo chamado `.gitignore` na raiz do projeto com este conteúdo:

```
node_modules/
.env.local
.env
.DS_Store
dist/
build/
.convex/
.vercel/
```

### 1.4 Adicionar todos os arquivos

```powershell
git add .
```

### 1.5 Fazer o primeiro commit

```powershell
git commit -m "Initial commit: Sebo Literario app"
```

---

## 📤 Passo 2: Criar Repositório no GitHub

### 2.1 Vá para https://github.com/new

### 2.2 Preencha:
- **Repository name**: `sebo-literario`
- **Description**: `Sebo - Biblioteca Digital com Convex`
- **Public** (para Netlify conseguir acessar)
- **Do NOT initialize** README, .gitignore, license

### 2.3 Clique em "Create repository"

### 2.4 Você verá instruções. Copie os comandos para um repo **existente**:

```powershell
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sebo-literario.git
git push -u origin main
```

### 2.5 Pode pedir sua senha do GitHub ou token. Se pedir:
1. Vá em https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Selecione `repo` (acesso completo)
4. Clique em "Generate"
5. **Copie o token** (aparece uma única vez)
6. Cole no terminal quando pedir a senha

---

## 🌐 Passo 3: Deploy no Netlify

### 3.1 Vá em https://app.netlify.com

### 3.2 Clique em "Add new site" → "Import an existing project"

### 3.3 Selecione "GitHub"
- Clique em "Authorize Netlify"
- Selecione o repositório `sebo-literario`

### 3.4 Configure o Build (importante!)

**Build command:**
```
npm run build
```

**Publish directory:**
```
.
```

(Deixe assim porque é um site estático HTML/CSS/JS)

### 3.5 Clique em "Deploy"

**Pronto!** Seu site estará live em `https://seu-nome.netlify.app` 🎉

---

## 📝 Para Atualizações Futuras

Sempre que fizer mudanças:

```powershell
cd "c:\Users\Usuario\Desktop\sebo literario"
git add .
git commit -m "Descrição da mudança"
git push
```

O Netlify **automaticamente** fará deploy da nova versão!

---

## 🆘 Troubleshooting

### Erro: "fatal: not a git repository"
- Certifique-se de estar na pasta correta
- Execute `git init` novamente

### Erro: "Permission denied"
- Você digitou a senha do GitHub errado
- Use um **Personal Access Token** em vez de senha

### Site não apareceu após push
- Espere 1-2 minutos
- Vá em https://app.netlify.com e veja o status do build

---

## 💡 Dicas

1. **README.md**: Crie um na raiz do projeto explicando o que é o Sebo
2. **Auto-deploy**: Toda vez que fizer `git push`, Netlify faz deploy automaticamente
3. **Custom Domain**: No Netlify, você pode conectar um domínio próprio
4. **Variáveis de Ambiente**: Configure VITE_CONVEX_URL nas configurações do Netlify se necessário

