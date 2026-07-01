# AjanhallintaVETO

MVP web application for tracking study-related project hours and calculating ECTS credits.

## Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- Supabase Auth and PostgreSQL with Row Level Security
- Zod for validation
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the public Supabase values in `.env.local`, then run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

Time durations are stored as integer minutes. ECTS credits are calculated from minutes, where 27 hours equals 1 ECTS credit.
