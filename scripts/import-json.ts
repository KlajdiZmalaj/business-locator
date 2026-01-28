import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env from .env.local
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ApifyRecord {
  title?: string;
  price?: string;
  categoryName?: string;
  address?: string;
  neighborhood?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
  phone?: string;
  phoneUnformatted?: string;
  location?: { lat?: number; lng?: number };
  totalScore?: number;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  placeId?: string;
  cid?: string;
  categories?: string[];
  reviewsCount?: number;
  imagesCount?: number;
  imageUrl?: string;
  hotelStars?: string;
  url?: string;
  website?: string;
  domain?: string;
  emails?: string[];
  phones?: string[];
  instagrams?: string[];
  facebooks?: string[];
  twitters?: string[];
  youtubes?: string[];
  tiktoks?: string[];
  linkedIns?: string[];
  whatsapps?: string[];
  openingHours?: unknown[];
  additionalInfo?: Record<string, unknown>;
  isAdvertisement?: boolean;
  searchString?: string;
}

async function importData() {
  const filePath = path.join(process.cwd(), "dataset_crawler-google-places_2026-01-27_23-54-46-964.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const records: ApifyRecord[] = JSON.parse(rawData);

  console.log(`Found ${records.length} records to import`);

  // Load existing phones to avoid duplicates
  const { data: existing } = await supabase.from("businesses").select("name, phone");
  const existingNames = new Set<string>();
  const existingPhones = new Set<string>();

  if (existing) {
    for (const b of existing) {
      if (b.name) existingNames.add(b.name.toLowerCase());
      if (b.phone) existingPhones.add(b.phone);
    }
  }
  console.log(`Loaded ${existingNames.size} existing names, ${existingPhones.size} existing phones`);

  const now = new Date().toISOString();
  const toInsert = [];
  const processedPhones = new Set<string>();
  let skipped = 0;

  for (const record of records) {
    if (record.isAdvertisement || !record.title) {
      skipped++;
      continue;
    }

    const nameLower = record.title.toLowerCase();

    // Skip if name already exists
    if (existingNames.has(nameLower)) {
      console.log(`[SKIP] ${record.title} (name exists)`);
      skipped++;
      continue;
    }

    // Skip if phone already exists
    if (record.phone && (existingPhones.has(record.phone) || processedPhones.has(record.phone))) {
      console.log(`[SKIP] ${record.title} (phone ${record.phone} exists)`);
      skipped++;
      continue;
    }

    const businessRecord = {
      name: record.title,
      phone: record.phone || null,
      phone_unformatted: record.phoneUnformatted || null,
      review_count: record.reviewsCount || 0,
      rating: record.totalScore ?? null,
      address: record.address || null,
      latitude: record.location?.lat || 41.3275,
      longitude: record.location?.lng || 19.8187,
      website: record.website || null,
      maps_url: record.url || null,
      search_query: record.searchString || "gym Tirana",
      scraped_at: now,
      price: record.price || null,
      category_name: record.categoryName || null,
      categories: record.categories || [],
      neighborhood: record.neighborhood || null,
      street: record.street || null,
      city: record.city || null,
      postal_code: record.postalCode || null,
      state: record.state || null,
      country_code: record.countryCode || null,
      permanently_closed: record.permanentlyClosed || false,
      temporarily_closed: record.temporarilyClosed || false,
      place_id: record.placeId || null,
      cid: record.cid || null,
      images_count: record.imagesCount || 0,
      image_url: record.imageUrl || null,
      hotel_stars: record.hotelStars || null,
      emails: record.emails || [],
      phones: record.phones || [],
      instagram: record.instagrams?.[0] || null,
      facebook: record.facebooks?.[0] || null,
      twitter: record.twitters?.[0] || null,
      youtube: record.youtubes?.[0] || null,
      tiktok: record.tiktoks?.[0] || null,
      linkedin: record.linkedIns?.[0] || null,
      whatsapp: record.whatsapps?.[0] || null,
      domain: record.domain || null,
      opening_hours: record.openingHours || [],
      additional_info: record.additionalInfo || {},
    };

    toInsert.push(businessRecord);
    if (record.phone) processedPhones.add(record.phone);
    console.log(`[ADD] ${record.title}`);
  }

  console.log(`\nInserting ${toInsert.length} records (skipped ${skipped})...`);

  if (toInsert.length > 0) {
    const { data, error } = await supabase.from("businesses").insert(toInsert);

    if (error) {
      console.error("Insert error:", error.message);
    } else {
      console.log(`Successfully inserted ${toInsert.length} records!`);
    }
  }
}

importData().catch(console.error);
