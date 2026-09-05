# Pantry Passport Backend

The backend is an Express API that protects Open Food Facts integration behind normalized DTOs, stores demo-user search and subscription data in MySQL, and synchronizes Stripe test subscriptions.

## Technology

- Express 5 and TypeScript 6
- Zod request and environment validation
- Prisma 7 with the MariaDB adapter for MySQL
- Stripe Node SDK
- Vitest and Supertest

## Setup

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/food_finder"
PORT=4000
FRONTEND_URL="http://localhost:3000"
OPEN_FOOD_FACTS_BASE_URL="https://world.openfoodfacts.org"
DEMO_USER_EMAIL="demo@example.com"
DEMO_USER_NAME="Demo User"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
STRIPE_SUCCESS_PATH="/subscription/success"
STRIPE_CANCEL_PATH="/subscription/cancel"
```

Only Stripe test keys are accepted. `STRIPE_PRICE_ID` must reference a recurring test-mode Price.

## MySQL and Prisma

Create the database in MySQL:

```sql
CREATE DATABASE food_finder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Generate Prisma Client, apply migrations, and seed the demo user:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

The schema contains:

- `User`: seeded demo-user identity and Stripe customer mapping
- `SearchHistory`: normalized query, language, result count, and timestamps
- `Subscription`: Stripe identifiers, status, billing period, and cancellation state
- `WebhookEvent`: Stripe event IDs for idempotent processing

## Running the API

```bash
npm run dev --workspace backend
```

The API runs at `http://localhost:4000` by default.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health status |
| `GET` | `/api/products/search?q=pasta&lang=en` | Search and normalize products |
| `GET` | `/api/searches/recent?limit=6` | Return demo-user search history |
| `GET` | `/api/subscription/status` | Return subscription and nutrition-access state |
| `POST` | `/api/subscription/checkout` | Create a Stripe subscription Checkout Session |
| `POST` | `/api/subscription/sync` | Reconcile a completed Checkout or missed webhook |
| `POST` | `/api/subscription/cancel` | Schedule cancellation at the billing-period end |
| `POST` | `/api/webhooks/stripe` | Verify and process signed Stripe events |

Protected application routes resolve the configured seeded demo user through middleware. This is an assessment simplification, not production authentication.

## Stripe Webhooks

Start the backend, then run Stripe CLI in a separate terminal:

```bash
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the listener's `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`, then restart the backend. Keep the listener running while testing subscriptions locally.

Handled events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Checkout and subscription metadata identify the demo user. The success-page sync endpoint provides a recovery path when a local webhook was missed. Cancellation uses `cancel_at_period_end`, so active access continues through the paid period.

## Access Control

Nutrition authorization is enforced before the API response is created:

- `ACTIVE` and `TRIALING` subscriptions receive detailed nutrition data.
- Other statuses receive `nutrition: null` and a locked indicator when nutrition exists.
- The frontend cannot reveal values that the backend did not authorize.

## Error Handling

Zod and domain errors are returned through one error middleware with a stable code, safe message, and request ID. Stripe secrets, database details, and stack traces are not returned to clients.

## Commands

```bash
npm run typecheck --workspace backend
npm run lint --workspace backend
npm run test --workspace backend
npm run build --workspace backend
```
