# CLAUDE.md

## Project Overview

Skrrapi iProPixel -- a Next.js 16 app that scrapes Google Maps via Apify, stores results in Supabase, and provides an authenticated admin dashboard. Focused on Tirana, Albania with 27 neighborhood zones.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

## Architecture

- **Next.js App Router** with server-side API routes and client components
- **Supabase** for PostgreSQL storage, Realtime WebSocket channels, and Auth
- **Apify** for Google Maps scraping (actor `nwua9Gu5YrADL7ZDj`)
- **Shadcn/Radix UI** component library in `components/ui/`
- **Iconify** for icons (`@iconify/react`)

## Authentication

- Supabase Auth with cookie-based sessions via `@supabase/ssr`
- Middleware (`middleware.ts`) protects `/admin/*` routes, redirects to `/login`
- No signup -- admin accounts are created manually in Supabase
- All API routes require a valid session (return 401 otherwise)
- Auth callback at `/auth/callback` handles code exchange

## Route Structure

| Route              | Access  | Purpose                          |
| ------------------ | ------- | -------------------------------- |
| `/`                | Public  | Landing page                     |
| `/login`           | Public  | Email + password login           |
| `/admin`           | Auth    | Dashboard (stats + business list)|
| `/admin/finder`    | Auth    | Scraper UI with real-time logs   |
| `/admin/email`     | Auth    | Email sender                     |
| `/admin/phone`     | Auth    | SMS sender                       |
| `/auth/callback`   | Public  | Supabase auth code exchange      |

## Key Files

| File                                 | Purpose                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `middleware.ts`                      | Auth middleware -- protects `/admin/*`, redirects unauthenticated to `/login`                       |
| `lib/supabase-server.ts`            | Server-side Supabase client with cookie-based auth (server components & API routes)                |
| `lib/supabase-client.ts`            | Browser Supabase client with cookie-based auth (client components)                                 |
| `lib/supabase-admin.ts`             | Server-side Supabase (service role key) for DB operations                                          |
| `lib/api-auth.ts`                   | `requireAuth()` helper for API route protection                                                    |
| `lib/supabase.ts`                   | Legacy client-side Supabase (anon key, used for Realtime)                                          |
| `lib/types.ts`                      | Shared TypeScript interfaces                                                                       |
| `app/api/scrape-businesses/route.ts`| POST -- starts Apify actor, streams logs via Supabase Realtime, processes results into DB          |
| `app/api/businesses/route.ts`       | GET (paginated list with filters) and DELETE                                                       |
| `app/api/stats/route.ts`            | GET aggregated dashboard statistics                                                                |
| `app/api/send-emails/route.ts`      | POST -- sends emails to businesses via Nodemailer                                                  |
| `app/api/send-sms/route.ts`         | POST -- sends SMS to businesses via SMS.to                                                         |
| `components/scraper-panel.tsx`      | Scraper UI with real-time log viewer                                                               |
| `components/businesses-list.tsx`    | Main business table with filters, sorting, expandable rows, Excel export                           |
| `components/stats-cards.tsx`        | Dashboard stat cards                                                                               |
| `components/navbar.tsx`             | Admin navigation bar with logout button                                                            |

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anon/public key
- `SUPABASE_SERVICE_KEY` -- Supabase service role key (server-side only)
- `APIFY_API_KEY` -- Apify API key (for scraper)

Optional:

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` -- SMTP config for email sending
- `SMSTO_API_KEY` -- SMS.to API key for SMS sending

## Code Conventions

- TypeScript strict mode
- Client components use `"use client"` directive
- Tailwind CSS 4 for styling, no CSS modules
- UI primitives live in `components/ui/` (Shadcn pattern)
- `cn()` utility from `lib/utils.ts` for class merging
- Toast notifications via Sonner
- Server-side DB uses `getSupabaseAdmin()`, auth-aware server client uses `getSupabaseServer()`
- Browser auth client uses `getSupabaseBrowser()` from `lib/supabase-client.ts`
- Icons: Iconify (`@iconify/react`) for brand icons, Lucide for UI icons

## Real-time Log System

The scraper uses Supabase Realtime Broadcast channels for live log streaming:

1. Client generates a `scrapeId` (UUID), subscribes to `scrape-logs-{scrapeId}`
2. Server creates a logger that broadcasts to the same channel
3. Apify actor logs are streamed via `client.run(id).log().stream()`
4. A 20s heartbeat keeps the WebSocket alive during long actor runs
5. Log types: `info`, `success`, `error`, `item-new`, `item-update`, `item-skip`

## Database

Single `businesses` table in Supabase with 35+ columns. Key constraints:

- `id` is UUID primary key
- `phone` has a unique constraint
- Duplicate detection is name-based (case-insensitive)
- Batch inserts use chunks of 500 rows

## Scraping Flow

1. Client POSTs to `/api/scrape-businesses` with query, city, options, and `scrapeId`
2. Server loads existing businesses for dedup, starts Apify actor with `.start()`
3. Actor logs stream to client in real-time while `waitForFinish()` blocks
4. Results are categorized into inserts (new), updates (phone fill), or skips (duplicates)
5. Batch insert/update into Supabase, then return stats summary
