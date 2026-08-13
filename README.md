# 🎟️ Plataforma de Eventos e Ingressos — Verzel Elite Dev

Aplicação Fullstack desenvolvida para o desafio **Elite Dev 2026** da Verzel. O sistema consiste em uma plataforma onde organizadores publicam eventos com dados de APIs externas, clientes compram e gerenciam seus ingressos com foco em acessibilidade e segurança, e a portaria realiza a validação dos ingressos na entrada.

---

## 🛠️ Stack Tecnológica Completa

### Front-End & Framework
* **React:** Biblioteca base para a criação da interface do usuário.
* **Next.js (App Router):** Framework para React responsável pelas páginas, roteamento e renderização do projeto.
* **TypeScript:** Linguagem para garantir tipagem estática, reduzindo erros de código e melhorando a manutenção.
* **Tailwind CSS:** Framework CSS para criação de design moderno, responsivo e adaptado para temas de acessibilidade.

### Back-End & Regras de Negócio
* **Node.js:** Ambiente de execução do servidor.
* **Next.js API Routes (Serverless Functions):** Endpoints de API nativos do Next.js para processar autenticação, reservas e regras de negócio.
* **Prisma ORM:** Ferramenta de modelagem de dados para comunicação estruturada com o banco de dados PostgreSQL.

### Banco de Dados & Infraestrutura
* **PostgreSQL:** Banco de dados relacional para persistência de usuários, eventos, ingressos e registros de validação.
* **Supabase / Neon Postgres:** Serviço de hospedagem em nuvem para a instância do banco de dados PostgreSQL.
* **Vercel:** Plataforma de hospedagem para deploy contínuo e público da aplicação Fullstack.

---

---

## 🗄️ Instruções de Configuração do Banco de Dados (PostgreSQL + Prisma)

Para rodar e conectar o banco de dados PostgreSQL nesta aplicação:

* **1. Instalação do ORM:** O projeto utiliza o Prisma ORM. Dependências instaladas via: `npm install -D prisma`
* **2. Variáveis de Ambiente:** Configure o arquivo `.env` na raiz do projeto com a URL de conexão do PostgreSQL: `DATABASE_URL="postgresql://usuario:senha@localhost:5432/nomedobanco?schema=public"`
* **3. Gerar Artefatos do Prisma:** Execute o comando: `npx prisma generate`
* **4. Executar Migrations:** Para aplicar a criação das tabelas no banco de dados: `npx prisma migrate dev --name init`



### Integrações & Bibliotecas Auxiliares
* **TMDb API (The Movie Database):** API externa para catálogo de filmes e shows na criação de eventos pelo Organizador.
* **qrcode (npm package):** Biblioteca para geração de QR Codes seguros e infalsificáveis.
* **speakeasy:** Implementação do fluxo de Autenticação em Duas Etapas (2FA) para segurança dos ingressos.

---

## 🗓️ Diário de Bordo & Processo de Desenvolvimento

### 📍 10/08/2026 — Planejamento, Definição de Arquitetura e Escopo
* **Análise de Requisitos:** Leitura do desafio Verzel, definição do escopo funcional e não funcional.
* **Acessibilidade e Inclusão:** Definição das funcionalidades inclusivas (Modo Autismo/Focado, Baixa Visão/Idosos, Sensibilidade à Luz e Navegação Didática para Não Alfabetizados).
* **Decisões de Segurança:** Definição do uso de Autenticação em Duas Etapas (2FA) na aba "Meus Ingressos" antes da exibição do QR Code para prevenir clonagens.
* **Escolha da Stack:** Fechamento definitivo da arquitetura em **React + Next.js (TypeScript) + PostgreSQL** com **Prisma ORM**, priorizando uma execução limpa e deploy unificado na Vercel.

### 📍 11/08/2026 — Configuração Inicial do Ambiente e Projeto
* Inicialização do projeto no Visual Studio Code com Next.js e TypeScript.
* Estruturação inicial do repositório e elaboração do `README.md`.
* Configuração do Tailwind CSS e preparação para a criação das rotas e do modelo de dados no Prisma.
* Configuração do Banco de Dados: Instalação e inicialização do Prisma ORM com PostgreSQL.


---

## 📅 12/08/2026 — Modelagem das Tabelas (Schema Prisma), Migrations e Configuração de Testes

* **Modelagem de Dados:** Tabelas `User`, `Event`, `Ticket` e `Validation` criadas no Prisma Schema.
* **Banco de Dados:** Instância PostgreSQL configurada com sucesso no Supabase.
* **Migrations:** Estrutura gerada e sincronizada no banco em nuvem.
* **Ambiente de Testes:** Instalação das dependências do Vitest, Testing Library e configuração do `vitest.config.ts` prontas para a suíte de testes.

---



---

## 💡 Recursos Diferenciais de Acessibilidade & UX
* **Acessibilidade Neurodivergente (Modo Focado):** Redução de ruído visual para navegação simplificada por pessoas dentro do espectro autista ou TDAH.
* **Modo Baixa Visão & Idosos:** Tipografia ampliada e alto contraste ativável a qualquer momento.
* **Sensibilidade à Luz:** Esquema de cores e iluminação suave para não causar desconforto visual.
* **Navegação Didática:** Uso reforçado de ícones e indicadores visuais simples para facilitar a compreensão por pessoas não alfabetizadas.
* **Portaria Visual Interativa (Planta 2D):** Interface amigável da portaria simulando a planta física do local para facilitar o fluxo de validação e direcionamento no evento.

---

## 🤖 Uso Transparente de Inteligência Artificial (Gemini)

Em conformidade com as orientações do desafio, o uso de IA neste projeto foi conduzido com foco estrito em **organização, planejamento e produtividade de documentação**:

* **O que a IA (Gemini) fez:** Atuou exclusivamente como um assistente de organização e planejamento para estruturar o cronograma de 7 dias, formatar este `README.md` e organizar a documentação de decisões técnicas.
* **O que foi 100% idealizado por mim:** 
  * Toda a arquitetura do projeto e escolha definitiva das tecnologias.
  * O direcionamento e conceito de Acessibilidade Inclusiva (Modo Autismo/Focado, Baixa Visão/Idosos, Sensibilidade à Luz e Navegação Didática para Não Alfabetizados).
  * A estratégia de segurança com 2FA na exibição do QR Code na aba "Meus Ingressos".
  * A concepção visual e lógica da Tela de Portaria Interativa (Planta 2D).
  * O código-fonte, regras de negócio e validações da aplicação.