# ✅ Checklist de Implementação Convex

Use este checklist para acompanhar seu progresso!

## 📥 Pré-requisitos

- [ ] **Node.js 18+ instalado** - Verificar: `node --version` no terminal
- [ ] **Conta Convex ativa** - Você já tem!
- [ ] **Git instalado (opcional)** - Mas recomendado

---

## 🚀 Passo 1: Inicializar Projeto Node.js

```bash
cd "c:\Users\Usuario\Desktop\sebo literario"
npm init -y
npm install convex next @convex-dev/auth
```

**Checklist:**
- [ ] `npm init -y` executado
- [ ] `npm install` completado
- [ ] Ver `package.json` criado
- [ ] Ver pasta `node_modules` criada

---

## 🔧 Passo 2: Inicializar Convex

```bash
npx convex init
```

**O que isso faz:**
- Pede para você fazer login na conta Convex
- Cria pasta `convex/`
- Cria arquivo `convex.json`
- Cria `.env.local` com suas credenciais

**Checklist:**
- [ ] Executar `npx convex init`
- [ ] Fazer login com sua conta Convex
- [ ] Selecionar/criar projeto "sebo-literario"
- [ ] Ver pasta `convex/` criada
- [ ] Ver arquivo `.env.local` criado

---

## 📄 Passo 3: Copiar Templates dos Arquivos

Copie os arquivos da pasta `convex-templates/` para `convex/`:

```
De: c:\Users\Usuario\Desktop\sebo literario\convex-templates\
Para: c:\Users\Usuario\Desktop\sebo literario\convex\
```

**Arquivos a copiar:**
- [ ] `schema.ts` (substituir o existente)
- [ ] `auth.config.ts`
- [ ] `books.ts`
- [ ] `uploads.ts`
- [ ] `users.ts`

**Checklist:**
- [ ] Todos os 5 arquivos copiados
- [ ] Nenhuma pasta sobrescrita
- [ ] `_generated/` continua intacta

---

## 🗄️ Passo 4: Verificar Schema

Abra `convex/schema.ts` e verifique:

```typescript
export default defineSchema({
  users: defineTable({ /* ... */ }),
  books: defineTable({ /* ... */ }),
  uploads: defineTable({ /* ... */ }),
});
```

**Checklist:**
- [ ] Arquivo tem 3 tabelas: users, books, uploads
- [ ] Tabelas têm índices (_index)
- [ ] Não há erros de sintaxe

---

## ▶️ Passo 5: Rodar Convex Dev

```bash
npx convex dev
```

Isso:
1. Inicia o servidor local do Convex
2. Sincroniza schema com banco de dados
3. Gera tipos TypeScript automáticos

**Checklist:**
- [ ] Comando `npx convex dev` executado
- [ ] Ver mensagem "✓ Schema uploaded" 
- [ ] Ver URL do Convex no terminal (ex: http://localhost:3210)
- [ ] **NÃO fechar este terminal** (deixar rodando)

---

## 🌐 Passo 6: Abrir Novo Terminal para Frontend

Em um **novo terminal** PowerShell:

```bash
cd "c:\Users\Usuario\Desktop\sebo literario"
npm run dev
```

Ou simplesmente abra `index.html` em um navegador.

**Checklist:**
- [ ] Novo terminal aberto (sem fechar o Convex Dev)
- [ ] Frontend rodando ou index.html aberto
- [ ] Página carrega sem erros

---

## 🔌 Passo 7: Integrar com script.js

1. Copie o arquivo `convex-templates/convex-integration.js`
2. Importe no seu `script.js`:

```javascript
import {
  registerUser,
  loginUser,
  logoutUser,
  loadBooks,
  addNewBook,
  deleteBook,
  uploadPDF,
  getPdfUrl,
} from "./convex-integration.js";
```

3. Use as funções:

```javascript
// Registrar
const result = await registerUser("email@example.com", "senha", "Nome");

// Fazer login
await loginUser("email@example.com", "senha");

// Carregar livros
const books = await loadBooks();

// Adicionar livro
await addNewBook("Título", "Autor", "Descrição");
```

**Checklist:**
- [ ] Arquivo `convex-integration.js` copiado ou criado
- [ ] Funções importadas no `script.js`
- [ ] Atualizações feitas nos handlers de login/registro
- [ ] Página não mostra erros no console

---

## 🧪 Passo 8: Testar Funcionalidades

### Teste 1: Autenticação
```javascript
// No console do navegador:
import { registerUser, loginUser } from "./convex-integration.js";

// Registrar
await registerUser("teste@example.com", "senha123", "Teste");

// Fazer login
await loginUser("teste@example.com", "senha123");

// Verificar localStorage
localStorage.getItem("userId"); // deve retornar um ID
```

**Checklist:**
- [ ] Registro funcionou
- [ ] Login funcionou
- [ ] userId aparece no localStorage

### Teste 2: Livros
```javascript
import { loadBooks, addNewBook } from "./convex-integration.js";

// Carregar livros
const books = await loadBooks();
console.log(books); // deve ser um array

// Adicionar livro
await addNewBook("1984", "George Orwell", "Um clássico");

// Carregar novamente
const booksAtualizado = await loadBooks();
console.log(booksAtualizado); // deve ter 1 livro
```

**Checklist:**
- [ ] `loadBooks()` retorna array
- [ ] `addNewBook()` funcionou sem erros
- [ ] Livro aparece na lista

### Teste 3: Upload de PDF
```javascript
import { uploadPDF, addNewBook } from "./convex-integration.js";

// Selecionar arquivo (você pode usar um PDF local)
const fileInput = document.getElementById("seu-input-file");
const file = fileInput.files[0];

// Fazer upload
const result = await uploadPDF(file);
console.log(result); // { success: true, storageId: "..." }

// Adicionar livro com PDF
await addNewBook("Livro", "Autor", "Descrição", "", result.storageId);
```

**Checklist:**
- [ ] Upload não deu erro
- [ ] `storageId` foi retornado
- [ ] Livro com PDF foi criado

---

## 🐛 Debugging (Se Algo der Errado)

### Erro: "npm: command not found"
- [ ] Node.js não está instalado
- **Solução:** Instale em https://nodejs.org

### Erro: "Convex credentials not found"
- [ ] `npx convex init` não foi executado corretamente
- **Solução:** Delete `.env.local` e execute `npx convex init` novamente

### Erro: "User not authenticated"
- [ ] Usuário não fez login
- **Solução:** Chame `loginUser()` antes de usar outras funções

### Erro: "VITE_CONVEX_URL is not set"
- [ ] Arquivo `.env.local` não foi criado
- **Solução:** Execute `npx convex init` ou copie URL manualmente para `.env`

### Página em branco
- [ ] `convex dev` não está rodando
- **Solução:** Abra novo terminal e execute `npx convex dev`

---

## 📚 Próximos Passos (Extras)

- [ ] Adicionar validação de email
- [ ] Implementar reset de senha
- [ ] Adicionar foto de perfil
- [ ] Implementar compartilhamento de livros
- [ ] Adicionar comentários em livros
- [ ] Deploy para produção (Vercel + Convex)

---

## ✨ Parabéns!

Se você completou todo o checklist, seu Convex está pronto! 🚀

**Resumo do que foi feito:**
- ✅ Backend serverless rodando no Convex
- ✅ Banco de dados em nuvem sincronizado
- ✅ Autenticação segura
- ✅ Upload de arquivos integrado
- ✅ Frontend conectado ao backend

Qualquer dúvida, me chama! 💬
