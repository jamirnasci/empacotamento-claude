# Controle de Empacotamento

Next.js 15 (App Router) + TypeScript + Tailwind 4 + SQL Server (`mssql`).

## Como rodar

1. Crie o banco e execute `db/schema.sql` no SQL Server.
2. `cp .env.example .env.local` e preencha conexão e `SESSION_SECRET`.
3. `npm install`
4. Crie o primeiro administrador:
   `npm run seed:admin -- "Seu Nome" voce@empresa.com SuaSenha`
5. `npm run dev` → http://localhost:3000

## Funcionalidades

- Login com sessão em cookie httpOnly (JWT), senhas com bcrypt.
- Layout com sidebar + topbar; o botão de menu na topbar esconde/mostra a sidebar (lembra a escolha).
- CRUD de **empacotamentos**, **colaboradores**, **produtos** e **usuários**.
- **Produtos** e **Usuários**: somente `role = 'admin'` (bloqueado no middleware, nas páginas e nas server actions;
  itens de menu ocultos para não-admin).
- **Relatório**: filtros por colaborador, produto e período, com totais, resumo por colaborador/produto
  e detalhamento. Sem parâmetros, usa o mês atual como período.
- Registros já usados em empacotamentos não podem ser excluídos (FK) — inative-os.

## Estrutura

- `src/lib/` — db, sessão, auth, consultas de empacotamento, utilitários
- `src/middleware.ts` — proteção de rotas
- `src/app/(app)/*` — páginas autenticadas (cada entidade tem `actions.ts` com as server actions)
