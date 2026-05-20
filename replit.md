# FIFA World Cup 2026 Ticket Sales

A premium bilingual (Arabic/English) ticketing platform for FIFA World Cup 2026. Features a dark luxury design with full RTL support, real-time seat selection, order management, and a complete admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (wouter routing, TanStack Query, shadcn/ui, framer-motion)
- API: Express 5 (port 8080 → proxied at `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Fonts: Cairo (Arabic), Inter (English)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table schemas (matches, tickets, orders, posts)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas used by backend
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/worldcup-tickets/src/pages/` — React page components
- `artifacts/worldcup-tickets/src/lib/i18n.tsx` — language/RTL context

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod validators
- RTL support: `dir="rtl"` toggled on `<html>` via language context stored in localStorage
- Admin auth: Simple token stored in localStorage (`admin_token`); AdminGuard component redirects unauthorized users
- Telegram notifications: Fire-and-forget in orders route using `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` env vars
- Seat map: Visual CSS grid grouped by section (A-D), rows (1-5), seats from DB with real status coloring

## Product

- **Public**: Homepage with hero, featured matches, news; Matches listing with search; Match detail; Seat selector with real-time availability; Customer info form; Checkout/payment redirect
- **Admin**: Dashboard with stats; CRUD management for matches, tickets, orders, posts

## Admin Credentials

- Username: `admin` (set via `ADMIN_USERNAME` env var)
- Password: `worldcup2026` (set via `ADMIN_PASSWORD` env var)
- Route: `/admin/login`

## Telegram Notifications

Set these env vars to receive order notifications on Telegram:
- `TELEGRAM_BOT_TOKEN` — your bot token from @BotFather
- `TELEGRAM_CHAT_ID` — the chat/channel ID to send to

## User preferences

- Bilingual Arabic/English throughout — always update both language versions
- Dark luxury theme: deep navy background, gold primary accent (#D4AF37)
- Never use placeholder/mock data — always connect to real DB

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- The `type` declaration must come after all imports in TypeScript files
- `useLocation` from wouter returns `[location, setLocation]` — not a named `setLocation` export
- Row values in DB are stored as "Row 1", "Row 2" etc. (not "1", "2")
- When passing `enabled` to query hooks, always also pass `queryKey`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
