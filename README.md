# Pantry Passport

## Project overview

Pantry Passport is a technical-assessment project that lets a seeded demo user search packaged food products through a Next.js frontend and an Express backend. The frontend never calls Open Food Facts directly. Instead, the backend fetches Open Food Facts data, normalizes it into an internal DTO, stores recent searches in MySQL with Prisma, and enforces subscription-aware nutrition access using Stripe test-mode subscription state.

## Architecture

Next.js frontend  
-> Express backend  
-> Open Food Facts API  
-> MySQL via Prisma  
-> Stripe Checkout and Stripe webhooks

### Backend responsibilities

- Validate request input with Zod.
- Resolve the seeded demo user on every protected API request.
- Query Open Food Facts and normalize untrusted product data.
- Store recent searches with basic duplicate suppression.
- Create Stripe Checkout sessions in test mode.
- Verify Stripe webhook signatures using the raw request body before JSON parsing.
- Synchronize subscription state into MySQL and enforce nutrition authorization in the backend DTO.

### Frontend responsibilities

- Provide a manual language selector for `en`, `nl`, `de`, and `fr`.
- Persist the selected language in local storage.
- Call only the Express backend for search, recent-search, and subscription actions.
- Render loading, error, empty, locked, and unlocked states clearly.
- Redirect the user to Stripe Checkout from the backend-provided session URL.

## Requirements

- Node.js 24.20.0 LTS (use the repository `.nvmrc`)
- npm 11.19.0+
- MySQL 8+
- Stripe account with test-mode products and prices
- Stripe CLI for local webhook forwarding

## Installation

```bash
npm install
```

## Environment setup

Use the root [`.env.example`](/C:/Professional%20Projects/Test/.env.example), [backend/.env.example](/C:/Professional%20Projects/Test/backend/.env.example), and [frontend/.env.example](/C:/Professional%20Projects/Test/frontend/.env.example) as references.

1. Copy `backend/.env.example` to `backend/.env`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Fill in your MySQL connection string and Stripe test-mode values.

Required variables:

- `DATABASE_URL`
- `PORT`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `OPEN_FOOD_FACTS_BASE_URL`
- `DEMO_USER_EMAIL`
- `DEMO_USER_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_SUCCESS_PATH`
- `STRIPE_CANCEL_PATH`

## MySQL setup

1. Create a MySQL database, for example `food_finder`.
2. Update `DATABASE_URL` in `backend/.env`.
3. Make sure the configured user has permission to create tables and indexes.

Example:

```env
DATABASE_URL="mysql://root:password@localhost:3306/food_finder"
```

## Prisma migration

The repository includes an initial Prisma schema and SQL migration under [backend/prisma](/C:/Professional%20Projects/Test/backend/prisma).

Run:

```bash
npm run prisma:migrate --workspace backend
```

## Prisma seed

The seed creates one demo user and an initial canceled subscription row.

Run:

```bash
npm run prisma:seed --workspace backend
```

## Running frontend

```bash
npm run dev --workspace frontend
```

The frontend runs on `http://localhost:3000` by default.

## Running backend

```bash
npm run dev --workspace backend
```

The backend runs on `http://localhost:4000` by default and exposes:

- `GET /api/health`
- `GET /api/products/search?q=...&lang=en`
- `GET /api/searches/recent`
- `GET /api/subscription/status`
- `POST /api/subscription/checkout`
- `POST /api/webhooks/stripe`

## Running tests

Run everything:

```bash
npm test
```

Or per app:

```bash
npm run test --workspace backend
npm run test --workspace frontend
```

## Stripe test-mode configuration

1. Create a monthly recurring Stripe test-mode price.
2. Put the resulting price ID in `STRIPE_PRICE_ID`.
3. Put your test secret key in `STRIPE_SECRET_KEY`.
4. Start the backend before testing Checkout or webhooks.

The backend creates Checkout Sessions for the seeded demo user only. It stores Stripe customer and subscription identifiers in MySQL after webhook processing.

## Stripe CLI webhook testing

Use Stripe CLI to forward webhooks to the raw-body route:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Then copy the emitted signing secret into `STRIPE_WEBHOOK_SECRET`.

## Internationalization approach

- UI translations live in [frontend/src/i18n/translations.ts](/C:/Professional%20Projects/Test/frontend/src/i18n/translations.ts).
- The user selects language manually from four supported options: `en`, `nl`, `de`, `fr`.
- The selection is persisted in local storage and applied to the document language.
- The backend forwards the selected language to Open Food Facts using `lc=<lang>`.
- Product normalization attempts `product_name_<lang>` or `generic_name_<lang>` first, then falls back to default fields, then English fields.
- If Open Food Facts has incomplete localization for a product, the UI still renders using the documented fallback behavior instead of failing.

## Subscription/access-control approach

Nutrition authorization is enforced in the backend, not in React. The backend checks the demo user's subscription state from MySQL before building the product DTO:

- Everyone receives name, brand, and image data.
- Unsubscribed users receive `nutrition: null` plus a `nutritionLocked` flag when nutrition exists but is restricted.
- Active subscribers receive detailed nutrition values.

This prevents accidental client-side leakage of premium data.

## Technical decisions

- Express is kept intentionally thin: routes validate input and delegate to services.
- Open Food Facts data is treated as untrusted and normalized before it reaches the client.
- Prisma models include subscription identifiers, timestamps, and indexes for recent-search lookups.
- Stripe webhooks are made reasonably idempotent with a `WebhookEvent` table keyed by Stripe event ID.
- The app intentionally uses one seeded demo user instead of production authentication because that is the simplest honest fit for the assessment.
- Search history skips duplicate query-language pairs within a short time window to reduce noisy records.

## Simplifications

- One seeded demo user is used instead of full authentication.
- The app does not implement pagination beyond a small fixed Open Food Facts page size.
- Subscription access is tied to the demo user only.
- Checkout success may appear before the Stripe webhook has finished syncing the final subscription status.

## Known limitations

- Open Food Facts localization and nutrition quality vary by product because the dataset is community-maintained.
- Live Checkout and webhook verification require valid Stripe test credentials.
- The repository includes Prisma migrations for MySQL, but this environment did not include a running MySQL instance for end-to-end database execution.
- Recent-search deduplication is time-window based and intentionally simple.

## File and folder structure

```text
/
  backend/
    prisma/
    src/
    test/
  frontend/
    src/
  .env.example
  README.md
```

## Commands to run locally

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
npm run dev --workspace backend
npm run dev --workspace frontend
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Features implemented

- Product search through Express only
- Open Food Facts normalization and fallback handling
- Manual i18n with four supported languages
- Demo-user backed recent-search persistence contract
- Stripe Checkout session creation
- Stripe webhook signature verification with raw request-body handling
- Backend-enforced premium nutrition authorization
- Meaningful automated tests around normalization, access control, validation, webhook sync, and recent-search behavior

## TECHNICAL REVIEW PREPARATION

### Likely interviewer questions

**Why split frontend and backend instead of calling Open Food Facts directly from Next.js?**  
This repository keeps Open Food Facts behind Express so the frontend never depends on the external payload shape, error model, or localization quirks. The backend owns normalization and premium-data authorization.

**How does Next.js fit into the architecture here?**  
The App Router serves a small client-heavy search surface. Server Components are still used for page/layout boundaries, while interactive search, language persistence, and Stripe redirects live inside client components.

**Why use Express if Next.js can also expose API routes?**  
The assessment explicitly asked for an Express backend. Keeping it separate also makes webhook raw-body handling, Prisma access, and service-layer testing straightforward.

**How is Prisma used?**  
Prisma models `User`, `SearchHistory`, `Subscription`, and `WebhookEvent`. `SearchHistory` stores successful searches, `Subscription` stores Stripe state, and `WebhookEvent` prevents duplicate processing.

**Why MySQL and not SQLite?**  
The assignment required MySQL. The Prisma schema and migration are written for MySQL specifically, including enum columns and indexes.

**How do you protect against messy Open Food Facts data?**  
`normalizeProduct` treats every external field as optional. Products without a usable name are dropped, and missing image, brand, or nutrition fields become safe `null` or omitted values instead of crashing the UI.

**How does Stripe Checkout work in this repo?**  
`POST /api/subscription/checkout` creates a Stripe subscription Checkout Session in test mode for the seeded demo user. The frontend only receives the Checkout URL and redirects there.

**Why does webhook signature verification need special middleware?**  
Stripe signs the raw request body bytes. If Express JSON parsing runs first, the original bytes are lost and signature verification can fail. This repo mounts `express.raw({ type: "application/json" })` on `/api/webhooks` before `express.json()`.

**How is subscription authorization enforced?**  
The backend reads the demo user's subscription row from MySQL. If the status is not `ACTIVE` or `TRIALING`, nutrition fields are omitted from the response. React only renders what the API is allowed to send.

**How is internationalization handled?**  
Translations are stored manually in a small TypeScript dictionary. The user chooses a language, the frontend persists it locally, and the backend uses the selected language when requesting localized product data from Open Food Facts.

**How are API errors handled?**  
Zod validation errors and domain errors are turned into a consistent response shape with a stable error code, safe message, and request ID. The frontend fetcher converts those into a typed client error for UI display.

**What did you test?**  
The tests cover normalization with missing fields, premium nutrition withholding, nutrition access for active subscribers, invalid query rejection, Open Food Facts failure propagation, subscription summary logic, webhook-driven subscription updates, and recent-search deduplication/retrieval.

**What are the main tradeoffs?**  
The repo optimizes for clarity over breadth. It intentionally avoids full auth, advanced caching, background jobs, and complex admin tooling so the main assessment requirements stay easy to explain and defend in review.
