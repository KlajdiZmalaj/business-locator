# CLAUDE.md

## Project Overview

Google Maps Business Finder -- a Next.js 16 app that scrapes Google Maps via Apify, stores results in Supabase, and provides a dashboard UI. Focused on Tirana, Albania with 27 neighborhood zones.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

## Architecture

- **Next.js App Router** with server-side API routes and client components
- **Supabase** for PostgreSQL storage and Realtime WebSocket channels
- **Apify** for Google Maps scraping (actor `nwua9Gu5YrADL7ZDj`)
- **Shadcn/Radix UI** component library in `components/ui/`

## Key Files

| File | Purpose |
|---|---|
| `app/api/scrape-businesses/route.ts` | POST endpoint -- starts Apify actor, streams logs via Supabase Realtime, processes results into DB |
| `app/api/businesses/route.ts` | GET (paginated list with filters) and DELETE |
| `app/api/stats/route.ts` | GET aggregated dashboard statistics |
| `components/scraper-panel.tsx` | Scraper UI with real-time log viewer |
| `components/businesses-list.tsx` | Main business table with filters, sorting, expandable rows, Excel export |
| `components/stats-cards.tsx` | Dashboard stat cards |
| `lib/supabase.ts` | Client-side Supabase (anon key) |
| `lib/supabase-admin.ts` | Server-side Supabase (service role key) |
| `lib/types.ts` | Shared TypeScript interfaces |

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anon/public key
- `SUPABASE_SERVICE_KEY` -- Supabase service role key (server-side only)
- `APIFY_API_KEY` -- Apify API token

## Code Conventions

- TypeScript strict mode
- Client components use `"use client"` directive
- Tailwind CSS 4 for styling, no CSS modules
- UI primitives live in `components/ui/` (Shadcn pattern)
- `cn()` utility from `lib/utils.ts` for class merging
- Toast notifications via Sonner
- Server-side Supabase uses `getSupabaseAdmin()`, client-side uses `getSupabase()`

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
