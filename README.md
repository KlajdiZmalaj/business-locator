# Google Maps Business Finder

A full-stack Next.js application that scrapes businesses from Google Maps using Apify, stores them in Supabase, and provides a dashboard for browsing, filtering, and exporting the data. Built for discovering businesses in Tirana, Albania with neighborhood-level granularity.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** Supabase (PostgreSQL + Realtime)
- **Scraping:** Apify Google Maps Scraper actor
- **UI:** Tailwind CSS 4, Radix UI primitives, Lucide icons, Sonner toasts
- **Export:** XLSX (Excel)

## Features

- **Business Finder** -- trigger Google Maps scrapes by business type and city, with optional neighborhood-level targeting across 27 Tirana neighborhoods
- **Real-time Logs** -- live streaming of scrape progress and Apify actor logs via Supabase Realtime channels
- **Dashboard** -- aggregated stats (total businesses, average rating, review counts, phone/email/website/social coverage, top categories)
- **Business List** -- paginated table with sorting, search, and filters (by reviews, phone availability, missing website)
- **Expandable Details** -- full business info including address, social links, opening hours, and image preview
- **Excel Export** -- download filtered results with 30+ columns
- **Duplicate Detection** -- name-based deduplication and phone uniqueness enforcement
- **Dark Mode** -- system-aware theme switching

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Apify](https://apify.com) account with API key

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
APIFY_API_KEY=your-apify-api-key
```

### Database Setup

Create a `businesses` table in Supabase with these columns:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `name` | text | |
| `phone` | text | Unique constraint |
| `phone_unformatted` | text | |
| `review_count` | integer | Default 0 |
| `rating` | float | |
| `address` | text | |
| `latitude` | float | |
| `longitude` | float | |
| `website` | text | |
| `maps_url` | text | |
| `search_query` | text | |
| `scraped_at` | timestamptz | |
| `created_at` | timestamptz | Default `now()` |
| `price` | text | |
| `category_name` | text | |
| `categories` | text[] | |
| `neighborhood` | text | |
| `street` | text | |
| `city` | text | |
| `postal_code` | text | |
| `state` | text | |
| `country_code` | text | |
| `permanently_closed` | boolean | Default false |
| `temporarily_closed` | boolean | Default false |
| `place_id` | text | |
| `cid` | text | |
| `images_count` | integer | Default 0 |
| `image_url` | text | |
| `hotel_stars` | text | |
| `emails` | text[] | |
| `phones` | text[] | |
| `instagram` | text | |
| `facebook` | text | |
| `twitter` | text | |
| `youtube` | text | |
| `tiktok` | text | |
| `linkedin` | text | |
| `whatsapp` | text | |
| `domain` | text | |
| `opening_hours` | jsonb | |
| `additional_info` | jsonb | |

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/
    businesses/route.ts       GET (list/filter) & DELETE
    scrape-businesses/route.ts POST (trigger Apify scraper)
    stats/route.ts             GET (aggregated statistics)
  finder/page.tsx              Scraper UI page
  page.tsx                     Dashboard home
components/
  ui/                          Radix-based UI primitives
  businesses-list.tsx          Paginated business table
  scraper-panel.tsx            Scraper controls + live logs
  stats-cards.tsx              Dashboard stats cards
  navbar.tsx                   Navigation bar
lib/
  supabase.ts                  Client-side Supabase instance
  supabase-admin.ts            Server-side Supabase (service key)
  types.ts                     TypeScript interfaces
  utils.ts                     Utility functions
scripts/
  import-json.ts               Bulk import from JSON file
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/businesses` | Paginated business list with filters and sorting |
| DELETE | `/api/businesses?id=UUID` | Delete a single business |
| POST | `/api/scrape-businesses` | Start a scrape job with real-time log streaming |
| GET | `/api/stats` | Aggregated dashboard statistics |

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
