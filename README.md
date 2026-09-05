# Pantry Passport

Pantry Passport is a full-stack packaged-food search application. A Next.js frontend calls an Express API that normalizes Open Food Facts data, stores recent searches in MySQL, and uses Stripe test subscriptions to control access to detailed nutrition values.

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS 4
- TanStack Query with selective browser-persistent caching
- Express 5, Zod, Prisma 7, and MySQL 8
- Stripe Checkout and signed webhooks
- Vitest, Testing Library, and ESLint

## Requirements

- Node.js `24.20.0` (see `.nvmrc`)
- npm `11.19.0` or newer
- MySQL 8+
- Stripe test-mode account and Stripe CLI

## Quick Start

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
npm run dev
```

Configure `backend/.env` and `frontend/.env.local` from their example files before running the application. The frontend runs at `http://localhost:3000` and the API at `http://localhost:4000`.

Forward Stripe test webhooks in a separate terminal:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

## Workspaces

- [Frontend documentation](frontend/README.md)
- [Backend documentation](backend/README.md)

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

This assessment intentionally uses one seeded demo user rather than a production authentication system.
