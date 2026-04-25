# Arquivos Convex Template

Esses arquivos devem ser copiados para a pasta `convex/` após executar `npx convex init`.

## Como usar:

1. Execute `npx convex init` na raiz do projeto
2. Isso vai criar a pasta `convex/` 
3. Copie os arquivos `.ts` desse diretório para `convex/`
4. Substitua o `convex/schema.ts` existente

## Arquivos inclusos:

- **schema.ts** - Definição das tabelas (users, books, uploads)
- **auth.config.ts** - Configuração de autenticação com Convex Auth
- **books.ts** - Funções para CRUD de livros
- **uploads.ts** - Funções para upload e download de PDFs
- **users.ts** - Funções relacionadas a usuários

## Próximo passo:

Depois de copiar os arquivos, execute:
```bash
npx convex dev
```

E veja o Convex rodar! 🚀
