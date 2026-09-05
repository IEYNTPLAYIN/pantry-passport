# Pantry Passport Frontend

The frontend is a Next.js App Router application for multilingual product search and Stripe subscription management. It communicates only with the Express backend; Open Food Facts and Stripe secret APIs are never called directly from the browser.

## Technology

- Next.js 16 and React 19
- TypeScript 6
- Tailwind CSS 4
- TanStack Query 5
- TanStack async storage persistence
- Vitest and Testing Library

## Setup

Create `frontend/.env.local` from `frontend/.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

From the repository root:

```bash
npm run dev --workspace frontend
```

The application is available at `http://localhost:3000`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product search, recent-search suggestions, language selection, and premium access entry point |
| `/subscription` | Subscription activation, status, cancellation, and billing-period information |
| `/subscription/success` | Checkout return and subscription reconciliation |
| `/subscription/cancel` | Canceled Checkout return state |

## Architecture

Frontend code is organized by feature:

```text
src/
  app/                  Next.js routes, layout, and global styles
  features/
    home/               Search-page composition and language selector
    products/           Search mutation and product cards
    searches/           Recent-search query and floating suggestions
    subscription/       Premium navigation, checkout, sync, and cancellation
  shared/
    api/                Typed backend client and error handling
    constants/          Query keys and supported languages
    i18n/               Translation dictionary and language persistence
    providers/          TanStack Query and persistent-cache setup
  types/index.d.ts      Global cross-feature contracts
```

Each feature exposes a barrel through `index.ts`. Feature-specific interfaces and types live in that feature's `types/index.d.ts`; only cross-feature contracts belong in the global type declaration file.

## Search Experience

- Submit searches by pressing Enter in the search input.
- Recent searches appear as a floating suggestion panel while the input is focused.
- Selecting a recent search runs it immediately.
- Product nutrition is rendered only when the backend includes authorized nutrition data.
- Locked product actions navigate to the dedicated subscription page.

## Localization

The UI supports `en`, `nl`, `de`, and `fr`. The selected language is stored in browser local storage and reused across visits. Search requests send the selected language to the backend for localized Open Food Facts results.

## Caching

TanStack Query manages server state. Recent searches and subscription summaries opt into local-storage persistence for up to 24 hours and refetch after becoming stale. Product nutrition payloads and Stripe mutation responses are intentionally excluded from persistent storage.

The backend remains the source of truth and independently enforces premium access.

## Subscription Flow

- Inactive users see **Activate Premium** on the home page.
- Active users see a crown button.
- Both open `/subscription`.
- Checkout redirects to the backend-created Stripe Checkout URL.
- The success page reconciles Stripe state and refreshes the subscription cache.
- Cancellation is scheduled for the billing-period end, preserving access until that date.

## Commands

```bash
npm run typecheck --workspace frontend
npm run lint --workspace frontend
npm run test --workspace frontend
npm run build --workspace frontend
```
