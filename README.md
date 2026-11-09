# FECAP - Fundação de Comércio Álvares Penteado

<p align="center">
<a href= "https://www.fecap.br/"><img src="https://cdn.nube.com.br/media/feira_estagio/escola/567/fecap.png" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# Troca Ticket

## Troca Ticket - Bingo

## Integrantes: <a href="https://www.linkedin.com/in/brenno-alves-souza-890b972b1/">Brenno Alves</a>, <a href="https://www.linkedin.com/in/gabriel-oliveira-a691b2353/">Gabriel Carrocci</a>, <a href="https://www.linkedin.com/in/julia-damasio-b6531a24a">Julia Damasio</a>, <a href="https://www.linkedin.com/in/lucas-araujo-pereira23/">Lucas Araujo</a>

## Professores Orientadores: <a href="https://www.linkedin.com/in/paula-astorino-432b5812a/">Paula Astorino</a>, <a href="https://www.linkedin.com/in/katia-bossi/">Kátia Bossi</a>, <a href="https://www.linkedin.com/in/francisco-escobar/">Francisco de Souza Escobar</a>, <a href="https://www.linkedin.com/in/dolemes/">David de Oliveira Lemes</a>, <a href="https://www.linkedin.com/in/j%C3%A9sus-gomes-83b769108/">Jésus Gomes</a>

## Descrição

<p align="center">
<img src="TrocaTicket_ Seu Próximo Grande Momento.png" width="700" alt="Troca Ticket" border="0">
</p>


O TrocaTicket é uma plataforma web de venda e gestão de ingressos para eventos, que
conecta organizadores, fornecedores e o público em um único ambiente. O sistema permite
que um organizador cadastre seu evento, configure lotes e tipos de ingresso, acompanhe
vendas e pedidos em tempo real por um painel de controle, e faça o controle de acesso no
dia do evento. Para o comprador, a plataforma centraliza a busca por eventos, a compra e
o recebimento do ingresso digital.

## 🛠 Estrutura de pastas

- **Raiz**
  - **Documentos**
    - **Entrega 1**
      - Cálculo - II
      - Desenvolvimento Web Full Stack
      - Gestão Empresarial e Dinâmicas das Organizações
      - Projeto Interdisciplinar Programação Web
      - Projetos em Banco de Dados
    - **Entrega 2**
      - Cálculo - II
      - Desenvolvimento Web Full Stack
      - Gestão Empresarial e Dinâmicas das Organizações
      - Projeto Interdisciplinar Programação Web
      - Projetos em Banco de Dados
      - Documentação.docx
  - **imagens**
  - **Src**
    - **Entrega 1**
      - Backend
      - Frontend
    - **Entrega 2**
      - server (API Node.js + Express + PostgreSQL)
      - client (React + Vite)

### Conteúdo de cada pasta

| Pasta | Conteúdo |
|---|---|
| **Documentos** | Toda a documentação, separada por entrega e por unidade curricular |
| **imagens** | Imagens do sistema (capa, prints, banner) |
| **Src** | Código-fonte, organizado por entrega |
| **server** | API, regras de negócio, scripts SQL e testes |
| **client** | Interface web que consome a API |

## 🛠 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior e npm
- [Git](https://git-scm.com/)
- Um banco PostgreSQL (local ou um projeto no [Supabase](https://supabase.com/))

### 1. Clonar o repositório

```bash
git clone https://github.com/2026-2-NCC2/Projeto1.git
cd Projeto1/Src/Entrega\ 2
```

### 2. Criar o banco de dados

No SQL Editor do Supabase (ou em um cliente PostgreSQL), execute os scripts da pasta `server/database`, nesta ordem:

1. `bancoPG.sql`: cria tabelas, tipos e índices.
2. `seed.sql` (opcional): carrega dados de exemplo para testar o sistema.

> Atenção: o `seed.sql` cria usuários com a senha padrão definida pela equipe. Não use esse script em um ambiente publicado sem trocar as senhas. O `reset.sql` apaga todo o schema `public`; use somente em banco de testes.

### 3. Configurar e iniciar o back-end

```bash
cd server
cp .env.example .env
npm ci
npm start
```

Edite o arquivo `.env` com seus valores:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL/Supabase |
| `JWT_SECRET` | Chave secreta para assinar os tokens (use um valor longo e aleatório) |
| `CORS_ORIGIN` | Endereço do front-end permitido, por exemplo `http://localhost:5173` |
| `PORT` | Porta da API (opcional, padrão `3000`) |

Para conferir que a API está no ar, acesse `http://localhost:3000/api/health`. A resposta esperada é `{"status":"ok"}`.

### 4. Configurar e iniciar o front-end

Em outro terminal:

```bash
cd client
npm ci
npm run dev
```

Se a API não estiver em `http://localhost:3000`, crie um arquivo `.env` na pasta `client` com:

```env
VITE_API_URL=<endereço da API>
```

O front-end abre em `http://localhost:5173`.

### 5. Executar os testes (opcional)

```bash
cd server
npm test
```
### Aplicação publicada

- Front-end: https://troca-ticket.vercel.app
- API: https://trocaticket-api.vercel.app (verificação de funcionamento em `/api/health`)
  
## 💻 Configuração para Desenvolvimento

### Variáveis de ambiente

As variáveis ficam em arquivos `.env`, que não são versionados.

| Pasta | Variável | Desenvolvimento local | Produção |
|---|---|---|---|
| `server` | `DATABASE_URL` | Conexão do seu PostgreSQL ou Supabase | Conexão do Supabase (pooler) |
| `server` | `JWT_SECRET` | Valor longo e aleatório | Valor forte, diferente do local |
| `server` | `CORS_ORIGIN` | `http://localhost:5173` | `https://troca-ticket.vercel.app` |
| `client` | `VITE_API_URL` | `http://localhost:3000` | `https://trocaticket-api.vercel.app` |

### Scripts

| Pasta | Comando | O que faz |
|---|---|---|
| `server` | `npm run dev` | Inicia a API com reinício automático (nodemon) |
| `client` | `npm run build` | Gera a versão de produção |
| `client` | `npm run lint` | Verifica o código com ESLint |

### Perfis de usuário

| Perfil | O que faz |
|---|---|
| Administrador | Aprova ou rejeita cadastros e acompanha os eventos |
| Organizador | Cria eventos, cadastra itens e custos, avalia propostas e vê o ticket estimado |
| Fornecedor | Vê eventos publicados e envia propostas por item de custo |

## 💾 Entregas

  | Entrega 1 |  Materia | Link |
  |---|---|---|
  |25/09 |Modelagem do Banco de Dados | [Acessse Aqui](Documentos/Entrega%201/Projeto%20em%20Banco%20de%20Dados/README.md) |
  |25/09 |Projeto Interdiciplinar (Figma) | [Acessse Aqui](Documentos/Entrega%201/Projeto%20Interdisciplinar%20-%20Programação%20Web/README.md) |
  |25/09 |Cálculo - II | [Acessse Aqui](Documentos/Entrega%202/C%C3%A1lculo%20-%20II/Entrega_2_C%C3%A1lculo.pdf) |
  |25/09 |Gestão Empresarial e Dinâmicas das Organizações | [Acessse Aqui](Documentos/Entrega%201/Gest%C3%A3o%20Empresarial%20e%20Din%C3%A2micas%20das%20Organiza%C3%A7%C3%B5es/Entrega%201.docx.PDF) |
  |25/09 |Desenvolvimento Web Full Stack | [Acessse Aqui](Src/Entrega%201/Frontend) |

  | Entrega 2 |  Materia | Link |
  |---|---|---|
  |09/11 |Modelagem do Banco de Dados | [Acessse Aqui](Documentos/Entrega%202/Projeto%20em%20Banco%20de%20Dados/README.md) |
  |09/11 |Projeto Interdiciplinar | [Acessse Aqui](Documentos/Entrega%202/Projeto%20Interdisciplinar%20-%20Programa%C3%A7%C3%A3o%20Web) |
  |09/11 |Cálculo - II | [Acessse Aqui](Documentos/Entrega%202/C%C3%A1lculo%20-%20II) |
  |09/11 |Gestão Empresarial e Dinâmicas das Organizações | [Acessse Aqui](Documentos/Entrega%202/Gest%C3%A3o%20Empresarial%20e%20Din%C3%A2micas%20das%20Organiza%C3%A7%C3%B5es/Entrega%201.docx.PDF) |
  |09/11 |Desenvolvimento Web Full Stack | [Acessse Aqui](https://troca-ticket.vercel.app/) |

## 📋 Licença/License
<a href="https://github.com/2026-2-NCC2/Projeto1"><font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;">Troca Ticket</font></font></a><font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;"> © 2026 por </font></font><a href="https://www.linkedin.com/in/brenno-alves-souza-890b972b1/">Brenno Alves</a>, <a href="https://www.linkedin.com/in/gabriel-oliveira-a691b2353/">Gabriel Carrocci</a>, <a href="https://www.linkedin.com/in/julia-damasio-b6531a24a">Julia Damasio</a>, <a href="https://www.linkedin.com/in/lucas-araujo-pereira23/">Lucas Araujo</a></font></font></a><font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;"> está licenciado sob </font></font><a href="https://creativecommons.org/licenses/by/4.0/"><font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;">Creative Commons Atribuição 4.0 Internacional</font></font></a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">

## 🎓 Aqui estão as referências usadas no projeto:
1. https://trocaticket.com.br/
