# TrocaTicket — frontend

React 19 + Vite + Tailwind CSS + react-router-dom.

```bash
npm ci
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (pasta dist)
npx eslint .     # verificação de código
```

O frontend conversa com a API em `http://localhost:3000/api`. Para usar outro endereço, crie um arquivo `.env` aqui com `VITE_API_URL=https://seu-backend/api`.

Rotas protegidas (`src/routes/index.jsx`) usam o perfil do usuário logado: `organizador` cria eventos, `fornecedor` envia propostas, `administrador` aprova cadastros.

Para subir o banco e o servidor, veja `../COMO-USAR-PROPOSTAS.md`.
