# Skrrapi iProPixel

A full-stack Next.js application that scrapes businesses from Google Maps using Apify, stores them in Supabase, and provides an authenticated admin dashboard for browsing, filtering, emailing, and SMS outreach. Built for discovering businesses in Tirana, Albania with neighborhood-level granularity.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Realtime + Auth)
- **Scraping:** Apify Google Maps Scraper actor
- **UI:** Tailwind CSS 4, Radix UI primitives, Iconify + Lucide icons, Sonner toasts
- **Email:** Nodemailer (SMTP)
- **SMS:** SMS.to API
- **Export:** XLSX (Excel)

## Features

- **Authentication** -- Supabase Auth with cookie-based sessions, middleware-protected admin routes, no public signup
- **Business Finder** -- trigger Google Maps scrapes by business type and city, with optional neighborhood-level targeting across 27 Tirana neighborhoods
- **Real-time Logs** -- live streaming of scrape progress and Apify actor logs via Supabase Realtime channels
- **Dashboard** -- aggregated stats (total businesses, average rating, review counts, phone/email/website/social coverage, top categories)
- **Business List** -- paginated table with sorting, search, and filters (by reviews, phone availability, missing website)
- **Expandable Details** -- full business info including address, social links, opening hours, and image preview
- **Excel Export** -- download filtered results with 30+ columns
- **Email Outreach** -- send templated emails to businesses with verified addresses
- **SMS Outreach** -- send SMS messages to businesses with phone numbers
- **Duplicate Detection** -- name-based deduplication and phone uniqueness enforcement

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with Auth enabled
- An [Apify](https://apify.com) account with API key

### Environment Variables

Create a `.env.local` file:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
APIFY_API_KEY=your-apify-api-key

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# SMS (optional)
SMSTO_API_KEY=your-smsto-api-key
```

### Database Setup

Create a `businesses` table in Supabase with these columns:

| Column               | Type        | Notes                                    |
| -------------------- | ----------- | ---------------------------------------- |
| `id`                 | uuid        | Primary key, default `gen_random_uuid()` |
| `name`               | text        |                                          |
| `phone`              | text        | Unique constraint                        |
| `phone_unformatted`  | text        |                                          |
| `review_count`       | integer     | Default 0                                |
| `rating`             | float       |                                          |
| `address`            | text        |                                          |
| `latitude`           | float       |                                          |
| `longitude`          | float       |                                          |
| `website`            | text        |                                          |
| `maps_url`           | text        |                                          |
| `search_query`       | text        |                                          |
| `scraped_at`         | timestamptz |                                          |
| `created_at`         | timestamptz | Default `now()`                          |
| `price`              | text        |                                          |
| `category_name`      | text        |                                          |
| `categories`         | text[]      |                                          |
| `neighborhood`       | text        |                                          |
| `street`             | text        |                                          |
| `city`               | text        |                                          |
| `postal_code`        | text        |                                          |
| `state`              | text        |                                          |
| `country_code`       | text        |                                          |
| `permanently_closed` | boolean     | Default false                            |
| `temporarily_closed` | boolean     | Default false                            |
| `place_id`           | text        |                                          |
| `cid`                | text        |                                          |
| `images_count`       | integer     | Default 0                                |
| `image_url`          | text        |                                          |
| `hotel_stars`        | text        |                                          |
| `emails`             | text[]      |                                          |
| `phones`             | text[]      |                                          |
| `instagram`          | text        |                                          |
| `facebook`           | text        |                                          |
| `twitter`            | text        |                                          |
| `youtube`            | text        |                                          |
| `tiktok`             | text        |                                          |
| `linkedin`           | text        |                                          |
| `whatsapp`           | text        |                                          |
| `domain`             | text        |                                          |
| `opening_hours`      | jsonb       |                                          |
| `additional_info`    | jsonb       |                                          |

### Auth Setup

1. Enable Email Auth in your Supabase project (Authentication > Providers)
2. Create an admin user manually in Supabase Dashboard (Authentication > Users)
3. There is no public signup -- all accounts are created by admins

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see the landing page. Sign in at `/login` to access the admin dashboard.

## Project Structure

```
middleware.ts                        Auth middleware (protects /admin/*)
app/
  page.tsx                           Public landing page
  login/page.tsx                     Login form (email + password)
  auth/callback/route.ts             Supabase auth code exchange
  admin/
    layout.tsx                       Admin layout (with navbar)
    page.tsx                         Dashboard (stats + business list)
    finder/page.tsx                  Scraper UI
    email/page.tsx                   Email sender
    phone/page.tsx                   SMS sender
  api/
    businesses/route.ts              GET (list/filter) & DELETE
    businesses/email-list/route.ts   GET businesses with emails
    businesses/phone-list/route.ts   GET businesses with phones
    scrape-businesses/route.ts       POST (trigger Apify scraper)
    stats/route.ts                   GET (aggregated statistics)
    send-emails/route.ts             POST (send emails via SMTP)
    send-sms/route.ts                POST (send SMS via SMS.to)
    sms-balance/route.ts             GET SMS.to account balance
    sms-messages/route.ts            GET SMS.to message history
components/
  ui/                                Radix-based UI primitives
  businesses-list.tsx                Paginated business table
  scraper-panel.tsx                  Scraper controls + live logs
  stats-cards.tsx                    Dashboard stats cards
  email-sender.tsx                   Email sending UI
  phone-sender.tsx                   SMS sending UI
  navbar.tsx                         Admin navigation bar with logout
lib/
  supabase-server.ts                 Server-side Supabase with cookie auth
  supabase-client.ts                 Browser Supabase with cookie auth
  supabase-admin.ts                  Server-side Supabase (service key)
  supabase.ts                        Legacy client-side Supabase (Realtime)
  api-auth.ts                        requireAuth() helper for API routes
  types.ts                           TypeScript interfaces
  utils.ts                           Utility functions
scripts/
  import-json.ts                     Bulk import from JSON file
```

## API Routes

All API routes require authentication (return 401 without valid session).

| Method | Route                           | Description                                      |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/api/businesses`               | Paginated business list with filters and sorting |
| DELETE | `/api/businesses?id=UUID`       | Delete a single business                         |
| GET    | `/api/businesses/email-list`    | Businesses with email addresses                  |
| GET    | `/api/businesses/phone-list`    | Businesses with phone numbers                    |
| POST   | `/api/scrape-businesses`        | Start a scrape job with real-time log streaming  |
| GET    | `/api/stats`                    | Aggregated dashboard statistics                  |
| POST   | `/api/send-emails`              | Send emails to selected businesses               |
| POST   | `/api/send-sms`                 | Send SMS to selected businesses                  |
| GET    | `/api/sms-balance`              | SMS.to account balance                           |
| GET    | `/api/sms-messages`             | SMS.to message history                           |

## Scripts

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run import-json   # Bulk import businesses from JSON
```
