# Minha Loja (Buy)

## Descrição

Loja virtual feita como projeto de estudo, para praticar um fluxo completo de e-commerce com Next.js: catálogo de produtos por categoria, busca, página de detalhes, carrinho, cadastro e login.

A ideia foi sair de um CRUD simples e lidar com problemas reais de uma loja: controle de estoque no carrinho, sessão de usuário autenticada, senha com hash e salt, e proteção contra redirecionamentos abertos nas ações de login/carrinho.

Não é uma loja real — não processa pagamentos nem vendas (ver aviso no rodapé do site).

## Como funciona

- **Front-end**: [Next.js 16](https://nextjs.org/) (App Router) com [React 19](https://react.dev/), estilizado com [Tailwind CSS](https://tailwindcss.com/) e componentes baseados em [Base UI](https://base-ui.com/) / [shadcn](https://ui.shadcn.com/).
- **Banco de dados**: [MySQL](https://www.mysql.com/), acessado via driver [`mysql2`](https://www.npmjs.com/package/mysql2) (pool de conexões em [lib/db.js](lib/db.js)).
- **Do front ao banco**: não há uma API REST separada. As páginas (`app/page.js`, `app/product/[id]/page.js`, etc.) são Server Components que consultam o MySQL diretamente durante a renderização. Ações do usuário (login, cadastro, adicionar/remover item do carrinho) passam por **Server Actions** do Next.js (`app/actions.js`), que validam os dados, falam com o banco através de `lib/db.js`, `lib/auth.js` e `lib/cart.js`, e então redirecionam/revalidam a página. Ou seja: Browser → Server Action/Server Component (Next.js) → `mysql2` → MySQL, tudo no mesmo processo Node, sem camada intermediária.
- **Autenticação**: sessões em cookie `httpOnly`, com token aleatório guardado na tabela `sessions` e senha armazenada com hash `scrypt` (sem bibliotecas externas de auth).

### Estrutura principal

```
app/            páginas (App Router) e Server Actions (actions.js)
lib/            acesso a dados: db.js, auth.js, cart.js
public/         assets estáticos
```

## Pré-requisitos e instalação

Pré-requisitos:

- [Node.js](https://nodejs.org/) 18 ou superior
- Um servidor [MySQL](https://www.mysql.com/) acessível localmente

Passos:

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco MySQL e as tabelas usadas pela aplicação (`categories`, `products`, `users`, `sessions`, `cart_items`), conforme as colunas usadas nas queries de `app/page.js`, `app/actions.js`, `lib/auth.js` e `lib/cart.js`.

3. Crie um arquivo `.env.local` na raiz do projeto com as credenciais do banco:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=minha_loja
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

Outros scripts disponíveis:

```bash
npm run build   # build de produção
npm run start   # inicia o build de produção
npm run lint    # roda o ESLint
```

## Licença

Projeto de estudo, sem licença formal definida — sinta-se livre para usar o código como referência.
