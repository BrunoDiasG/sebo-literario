# 📚 Sebo - Sua Biblioteca Digital

Uma plataforma web moderna para gerenciar e ler livros em PDF. Desenvolvida com HTML5, CSS3, JavaScript puro e integrada com **Convex** para armazenamento em nuvem.

## ✨ Funcionalidades

- 📖 **Gerenciamento de Livros**: Adicione, remova e organize suas obras literárias
- 🔐 **Autenticação Segura**: Sistema de login e registro com Convex Auth
- 📤 **Upload de PDFs**: Envie arquivos PDF para sua biblioteca pessoal
- 🌙 **Tema Claro/Escuro**: Alterne entre temas para conforto na leitura
- 📱 **Responsivo**: Interface adaptada para desktop e mobile
- ☁️ **Sincronização em Nuvem**: Seus dados sincronizam automaticamente via Convex
- 🎯 **Leitor de PDF Integrado**: Leia diretamente na plataforma com controle de fonte

## 🚀 Deploy (Netlify)

Este projeto está hospedado no Netlify com deploy automático a cada push no GitHub.

**URL de Produção**: [sebo-literario.netlify.app](https://sebo-literario.netlify.app)

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Convex (Backend-as-a-Service)
- **Hospedagem**: Netlify (CI/CD automático)
- **Versionamento**: Git + GitHub
- **Leitura de PDFs**: PDF.js

## 📋 Pré-requisitos

- Node.js 18+
- Git
- Conta Convex (https://convex.dev)
- Conta GitHub (para deploy)
- Conta Netlify (para hospedagem)

## ⚡ Início Rápido

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/sebo-literario.git
cd sebo-literario
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar Convex

```bash
npx convex dev
```

Isso vai:
- Criar uma conta/projeto no Convex
- Gerar o arquivo `.env.local` com sua URL
- Exibir a URL de deployment (copie isso!)

### 4. Configurar URL no App

1. Abra `http://localhost:5173` (ou a porta indicada)
2. Clique em **⚙️ Configurações**
3. Cole a URL do Convex fornecida pelo `npx convex dev`
4. Clique em **Salvar**

✅ **Pronto!** Seu app está funcional localmente.

## 📚 Estrutura do Projeto

```
sebo-literario/
├── convex/                 # Backend Convex
│   ├── schema.ts          # Definição do banco de dados
│   ├── books.ts           # Funções de livros
│   ├── users.ts           # Funções de usuários
│   ├── uploads.ts         # Gerenciamento de PDFs
│   └── auth.config.ts     # Configuração de autenticação
│
├── src/                    # Código do cliente
│   ├── db.js              # Client-side database utilities
│   ├── pdfutils.js        # Utilitários para PDFs
│   └── types/
│       └── index.d.ts     # Type definitions
│
├── index.html             # HTML principal
├── script.js              # JavaScript da app
├── style.css              # Estilos
├── manifest.json          # PWA manifest
├── package.json           # Dependências
└── .env.local             # Variáveis de ambiente (não commitar)
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```
VITE_CONVEX_URL=https://seu-projeto-xxxxx.convex.cloud
```

## 📖 Documentação

Veja os guias de setup:
- [CONVEX_SETUP.md](./CONVEX_SETUP.md) - Configurar o banco de dados Convex
- [GITHUB_NETLIFY_SETUP.md](./GITHUB_NETLIFY_SETUP.md) - Deploy no GitHub e Netlify

## 🌐 Deploy no Netlify

O repositório está configurado para deploy automático:

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "Sua mensagem"
   git push
   ```

2. **Netlify faz deploy automaticamente** ✨

Acompanhe em: [app.netlify.com](https://app.netlify.com)

## 🐛 Troubleshooting

### Erro ao fazer upload de PDF?
- Certifique-se de estar logado
- Confira se a URL do Convex está configurada
- Abra o console (F12) para ver mensagens de erro

### Livros não aparecem?
- Verifique se o Convex está inicializado (`npm convex dev`)
- Confirme que a URL está correta em Configurações

## 📝 Contribuindo

Para desenvolver localmente:

```bash
npm install
npx convex dev
# Em outro terminal:
npm run dev
```
   ```
   git clone <URL_DO_REPOSITORIO>
   ```
2. Navegue até o diretório do projeto:
   ```
   cd sebo-pwa
   ```
3. Abra o arquivo `index.html` em um navegador para iniciar a aplicação.

## Uso
- **Adicionar Livros**: Utilize a opção de adicionar obra para incluir novos livros na sua coleção. Você pode fazer upload de arquivos PDF.
- **Remover Livros**: Os livros podem ser removidos da coleção a qualquer momento.
- **Visualizar Livros**: Clique em um livro para visualizar seu conteúdo em PDF.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para melhorias e correções.

## Licença
Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.