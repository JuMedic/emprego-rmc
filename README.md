# Empregos RMC

Portal de empregos focado na Região Metropolitana de Campinas (RMC) - 18 cidades.

## 🚀 Deploy na Vercel

### 1. Criar banco de dados PostgreSQL

Use um desses serviços gratuitos:

- **[Neon](https://neon.tech)** (recomendado) - 0.5GB gratuito
- **[Supabase](https://supabase.com)** - 500MB gratuito  
- **[Railway](https://railway.app)** - $5 de crédito

### 2. Configurar variáveis na Vercel

Vá em **Settings > Environment Variables** e adicione:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DIRECT_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
```

Para gerar o NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Deploy

```bash
# Via CLI
npx vercel

# Ou conecte o repositório GitHub no dashboard da Vercel
```

### 4. Popular o banco de dados

Após o deploy, execute o seed:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar .env (copie de .env.example)
cp .env.example .env

# Subir PostgreSQL com Docker
docker run --name postgres-rmc -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=empregos_rmc -p 5432:5432 -d postgres:15-alpine

# Criar tabelas e popular dados
npx prisma db push
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

## 🏙️ Cidades da RMC

Campinas, Americana, Sumaré, Hortolândia, Indaiatuba, Valinhos, Vinhedo, Paulínia, Jaguariúna, Monte Mor, Nova Odessa, Santa Bárbara d'Oeste, Pedreira, Holambra, Artur Nogueira, Cosmópolis, Engenheiro Coelho, Santo Antônio de Posse

## 📦 Tech Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL
- NextAuth.js
- Tailwind CSS
- React Query
- Zod

## 📄 Licença

Projeto privado.
