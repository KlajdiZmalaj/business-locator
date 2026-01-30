import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ScrapeResponse, ScrapedBusiness } from "@/lib/types";
import { ApifyClient } from "apify-client";
import { requireAuth } from "@/lib/api-auth";

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const GOOGLE_MAPS_SCRAPER_ACTOR = "nwua9Gu5YrADL7ZDj";

// Tirana neighborhoods for granular Finding
const TIRANA_NEIGHBORHOODS = [
  "Blloku",
  "Qendra",
  "Komuna e Parisit",
  "Rruga e Kavajes",
  "Rruga e Durresit",
  "21 Dhjetori",
  "Lapraka",
  "Kombinat",
  "Don Bosko",
  "Selita",
  "Yzberisht",
  "Porcelan",
  "Astir",
  "Vasil Shanto",
  "Fresku",
  "Liqeni Artificial",
  "Sauk",
  "Kodra e Diellit",
  "Kinostudio",
  "Medreseja",
  "Ali Demi",
  "Rruga e Elbasanit",
  "Shkoza",
  "Bregu i Lumit",
  "Bathore",
  "Paskuqan",
];

interface ScrapeRequestBody {
  searchQuery: string;
  city: string;
  maxResults?: number;
  limit?: number;
  useNeighborhoods?: boolean;
  selectedNeighborhoods?: number[];
  skipDuplicates: boolean;
  scrapeId?: string;
  apifyApiKey?: string;
}

type LogType = "info" | "success" | "error" | "item-new" | "item-update" | "item-skip";

async function createLogger(scrapeId?: string) {
  let channel: ReturnType<ReturnType<typeof getSupabaseAdmin>["channel"]> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  if (scrapeId) {
    channel = getSupabaseAdmin().channel(`scrape-logs-${scrapeId}`);
    // Subscribe and wait for the channel to be joined so send() uses WebSocket
    await new Promise<void>((resolve) => {
      channel!.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          resolve();
        }
      });
    });
    // Keep the WebSocket alive during long waits (e.g. Apify actor runs)
    heartbeatInterval = setInterval(() => {
      channel!.send({
        type: "broadcast",
        event: "heartbeat",
        payload: {},
      });
    }, 20_000);
  }

  const log = (message: string, type: LogType = "info") => {
    console.log(message);
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "log",
        payload: { message, type, timestamp: new Date().toISOString() },
      });
    }
  };

  const cleanup = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    if (channel) {
      getSupabaseAdmin().removeChannel(channel);
    }
  };

  return { log, cleanup };
}

interface ScrapeStats {
  scraped: number;
  inserted: number;
  updated: number;
  duplicates: number;
  failed: number;
}

// Full Apify Google Maps Scraper result interface
interface ApifyPlaceResult {
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
  website?: string;
  phone?: string;
  phoneUnformatted?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
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
}

interface ExistingBusiness {
  id: string;
  phone: string | null;
}

interface BusinessToInsert {
  name: string;
  phone: string | null;
  phone_unformatted: string | null;
  review_count: number;
  rating: number | null;
  address: string | null;
  latitude: number;
  longitude: number;
  website: string | null;
  maps_url: string | null;
  search_query: string;
  scraped_at: string;
  // Extended fields
  price: string | null;
  category_name: string | null;
  categories: string[];
  neighborhood: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country_code: string | null;
  permanently_closed: boolean;
  temporarily_closed: boolean;
  place_id: string | null;
  cid: string | null;
  images_count: number;
  image_url: string | null;
  hotel_stars: string | null;
  emails: string[];
  phones: string[];
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  domain: string | null;
  opening_hours: unknown[];
  additional_info: Record<string, unknown>;
}

interface BusinessToUpdate {
  id: string;
  phone: string;
  phone_unformatted?: string;
}

function mapApifyResultToBusiness(result: ApifyPlaceResult): ScrapedBusiness {
  return {
    name: result.title,
    phone: result.phone || undefined,
    phone_unformatted: result.phoneUnformatted || undefined,
    reviews: result.reviewsCount || 0,
    rating: result.totalScore || null,
    address: result.address || undefined,
    latitude: result.location?.lat || 41.3275,
    longitude: result.location?.lng || 19.8187,
    website: result.website || undefined,
    maps_url: result.url || undefined,
    // Extended fields
    price: result.price || undefined,
    category_name: result.categoryName || undefined,
    categories: result.categories || [],
    neighborhood: result.neighborhood || undefined,
    street: result.street || undefined,
    city: result.city || undefined,
    postal_code: result.postalCode || undefined,
    state: result.state || undefined,
    country_code: result.countryCode || undefined,
    permanently_closed: result.permanentlyClosed || false,
    temporarily_closed: result.temporarilyClosed || false,
    place_id: result.placeId || undefined,
    cid: result.cid || undefined,
    images_count: result.imagesCount || 0,
    image_url: result.imageUrl || undefined,
    hotel_stars: result.hotelStars || undefined,
    emails: result.emails || [],
    phones: result.phones || [],
    instagram: result.instagrams?.[0] || undefined,
    facebook: result.facebooks?.[0] || undefined,
    twitter: result.twitters?.[0] || undefined,
    youtube: result.youtubes?.[0] || undefined,
    tiktok: result.tiktoks?.[0] || undefined,
    linkedin: result.linkedIns?.[0] || undefined,
    whatsapp: result.whatsapps?.[0] || undefined,
    domain: result.domain || undefined,
    opening_hours: result.openingHours || [],
    additional_info: result.additionalInfo || {},
  };
}

function createInsertRecord(business: ScrapedBusiness, searchQuery: string, now: string): BusinessToInsert {
  return {
    name: business.name!,
    phone: business.phone || null,
    phone_unformatted: business.phone_unformatted || null,
    review_count: business.reviews || 0,
    rating: business.rating ?? null,
    address: business.address || null,
    latitude: business.latitude || 41.3275,
    longitude: business.longitude || 19.8187,
    website: business.website || null,
    maps_url: business.maps_url || null,
    search_query: searchQuery,
    scraped_at: now,
    // Extended fields
    price: business.price || null,
    category_name: business.category_name || null,
    categories: business.categories || [],
    neighborhood: business.neighborhood || null,
    street: business.street || null,
    city: business.city || null,
    postal_code: business.postal_code || null,
    state: business.state || null,
    country_code: business.country_code || null,
    permanently_closed: business.permanently_closed || false,
    temporarily_closed: business.temporarily_closed || false,
    place_id: business.place_id || null,
    cid: business.cid || null,
    images_count: business.images_count || 0,
    image_url: business.image_url || null,
    hotel_stars: business.hotel_stars || null,
    emails: business.emails || [],
    phones: business.phones || [],
    instagram: business.instagram || null,
    facebook: business.facebook || null,
    twitter: business.twitter || null,
    youtube: business.youtube || null,
    tiktok: business.tiktok || null,
    linkedin: business.linkedin || null,
    whatsapp: business.whatsapp || null,
    domain: business.domain || null,
    opening_hours: business.opening_hours || [],
    additional_info: business.additional_info || {},
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  const auth = await requireAuth();
  if (auth.response) return auth.response as unknown as NextResponse<ScrapeResponse>;

  const startTime = Date.now();
  let loggerCleanup: (() => void) | undefined;

  try {
    const body: ScrapeRequestBody = await request.json();
    const {
      searchQuery,
      city,
      maxResults,
      limit,
      useNeighborhoods = false,
      selectedNeighborhoods = [],
      skipDuplicates,
      scrapeId,
      apifyApiKey,
    } = body;

    const { log, cleanup } = await createLogger(scrapeId);
    loggerCleanup = cleanup;

    const maxPlaces = maxResults || limit || 100;

    if (!searchQuery || !city) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: searchQuery, city",
          stats: { scraped: 0, inserted: 0, updated: 0, duplicates: 0, failed: 0 },
          sample: [],
        },
        { status: 400 },
      );
    }

    const resolvedApifyKey = apifyApiKey || APIFY_API_KEY;

    if (!resolvedApifyKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Apify API key is required. Enter it in the UI or set APIFY_API_KEY env var.",
          stats: { scraped: 0, inserted: 0, updated: 0, duplicates: 0, failed: 0 },
          sample: [],
        },
        { status: 400 },
      );
    }

    // Build search strings array based on neighborhoods
    let searchStringsArray: string[] = [];

    if (useNeighborhoods && selectedNeighborhoods.length > 0) {
      for (const idx of selectedNeighborhoods) {
        const neighborhood = TIRANA_NEIGHBORHOODS[idx];
        if (neighborhood) {
          searchStringsArray.push(`${searchQuery} ${neighborhood} ${city}`);
        }
      }
    } else {
      searchStringsArray = [searchQuery];
    }

    log(`${"=".repeat(70)}`);
    log(`[SCRAPE START] "${searchQuery}" in ${city}`);
    log(`[CONFIG] Max results: ${maxPlaces} | Skip duplicates: ${skipDuplicates}`);
    log(`[CONFIG] Neighborhoods: ${useNeighborhoods ? selectedNeighborhoods.length : "city-wide"}`);
    log(`${"=".repeat(70)}`);

    const stats: ScrapeStats = { scraped: 0, inserted: 0, updated: 0, duplicates: 0, failed: 0 };
    const sample: Partial<ScrapedBusiness>[] = [];

    // Load existing businesses as Map<nameLowercase, {id, phone}> for O(1) lookups
    const existingBusinesses = new Map<string, ExistingBusiness>();

    if (skipDuplicates) {
      log(`[DB] Loading existing businesses...`);
      const { data: existing, error } = await getSupabaseAdmin().from("businesses").select("id, name, phone");

      if (error) {
        log(`[DB] Error loading existing: ${error.message}`, "error");
      } else if (existing) {
        for (const b of existing) {
          if (b.name) {
            existingBusinesses.set(b.name.toLowerCase(), { id: b.id, phone: b.phone });
          }
        }
        log(`[DB] Loaded ${existing.length} existing businesses`);
      }
    }

    // Initialize Apify client
    const client = new ApifyClient({
      token: resolvedApifyKey,
    });

    // Prepare Apify actor input with all Finding options enabled
    const input = {
      includeWebResults: false,
      language: "en",
      locationQuery: city,
      maxCrawledPlacesPerSearch: maxPlaces,
      maxImages: 1,
      maximumLeadsEnrichmentRecords: 0,
      scrapeContacts: true,
      scrapeDirectories: false,
      scrapeImageAuthors: false,
      scrapePlaceDetailPage: true,
      scrapeReviewsPersonalData: false,
      scrapeSocialMediaProfiles: {
        // All disabled to save $0.10/profile
        facebooks: false,
        instagrams: false,
        tiktoks: false,
        twitters: false,
        youtubes: false,
      },
      scrapeTableReservationProvider: false,
      searchStringsArray,
      skipClosedPlaces: false,
    };

    log(` Starting Google Maps Scraper actor...`);
    log(` Search queries: ${searchStringsArray.join(", ")}`);

    // Start the Actor (non-blocking) so we can stream its logs
    const run = await client.actor(GOOGLE_MAPS_SCRAPER_ACTOR).start(input);
    log(` Run started (${run.id}). Streaming logs...`);

    // Stream Apify actor logs to the client in real-time
    const logStream = await client.run(run.id).log().stream();
    if (logStream) {
      let partial = "";
      logStream.on("data", (chunk: Buffer) => {
        partial += chunk.toString();
        const lines = partial.split("\n");
        // Keep the last incomplete line for next chunk
        partial = lines.pop()!;
        for (const line of lines) {
          if (line.trim()) {
            log(`[ACTOR] ${line}`, "info");
          }
        }
      });
    }

    // Wait for the run to finish
    const finishedRun = await client.run(run.id).waitForFinish();

    if (finishedRun.status !== "SUCCEEDED") {
      log(` Actor run ended with status: ${finishedRun.status}`, "error");
    }

    log(` Actor run completed. Fetching results...`);

    // Fetch results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    log(` Found ${items.length} places`, "success");

    // Prepare batches for insert and update
    const toInsert: BusinessToInsert[] = [];
    const toUpdate: BusinessToUpdate[] = [];
    const processedNames = new Set<string>();

    const now = new Date().toISOString();

    // Process results and categorize
    for (const item of items as ApifyPlaceResult[]) {
      if (item.isAdvertisement) {
        continue;
      }

      const business = mapApifyResultToBusiness(item);

      if (!business.name) {
        stats.failed++;
        continue;
      }

      stats.scraped++;
      const nameLower = business.name.toLowerCase();

      // Skip if we already processed this name in current batch
      if (processedNames.has(nameLower)) {
        stats.duplicates++;
        log(`    [=] ${business.name} (duplicate in batch)`, "item-skip");
        continue;
      }

      if (skipDuplicates) {
        const existing = existingBusinesses.get(nameLower);

        if (existing) {
          if (existing.phone) {
            stats.duplicates++;
            log(`    [=] ${business.name} (exists)`, "item-skip");
          } else if (business.phone) {
            toUpdate.push({
              id: existing.id,
              phone: business.phone,
              phone_unformatted: business.phone_unformatted,
            });
            log(`    [~] ${business.name} (will update phone: ${business.phone})`, "item-update");
            if (sample.length < 5) {
              sample.push({
                name: business.name,
                phone: business.phone,
                rating: business.rating,
                category_name: business.category_name,
              });
            }
          } else {
            stats.duplicates++;
            log(`    [=] ${business.name} (exists, no new phone)`, "item-skip");
          }
        } else {
          toInsert.push(createInsertRecord(business, searchQuery, now));
          log(
            `    [+] ${business.name} | ${business.category_name || "-"} | Phone: ${business.phone || "-"}`,
            "item-new",
          );
          if (sample.length < 5) {
            sample.push({
              name: business.name,
              phone: business.phone,
              rating: business.rating,
              category_name: business.category_name,
            });
          }
        }
      } else {
        toInsert.push(createInsertRecord(business, searchQuery, now));
        log(
          `    [+] ${business.name} | ${business.category_name || "-"} | Phone: ${business.phone || "-"}`,
          "item-new",
        );
        if (sample.length < 5) {
          sample.push({
            name: business.name,
            phone: business.phone,
            rating: business.rating,
            category_name: business.category_name,
          });
        }
      }

      processedNames.add(nameLower);
    }

    const supabase = getSupabaseAdmin();

    // Batch insert new businesses (in chunks of 500 for Supabase limits)
    if (toInsert.length > 0) {
      log(`[DB] Inserting ${toInsert.length} new businesses...`);
      const chunkSize = 500;

      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from("businesses").insert(chunk);

        if (error) {
          log(`[DB] Chunk ${i / chunkSize + 1} failed: ${error.message}. Retrying row-by-row...`, "error");
          // Retry individually so one bad row doesn't kill the whole chunk
          for (const row of chunk) {
            const { error: rowError } = await supabase.from("businesses").insert(row);
            if (rowError) {
              stats.failed++;
              log(`    [!] Failed: ${row.name} -- ${rowError.message}`, "error");
            } else {
              stats.inserted++;
            }
          }
          log(`[DB] Chunk ${i / chunkSize + 1} row-by-row done`, "info");
        } else {
          stats.inserted += chunk.length;
          log(`[DB] Inserted chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} records`, "success");
        }
      }
    }

    // Batch update existing businesses with new phone numbers
    if (toUpdate.length > 0) {
      log(`[DB] Updating ${toUpdate.length} businesses with phone numbers...`);

      for (const update of toUpdate) {
        const { error } = await supabase
          .from("businesses")
          .update({
            phone: update.phone,
            phone_unformatted: update.phone_unformatted || null,
            scraped_at: now,
          })
          .eq("id", update.id);

        if (error) {
          log(`[DB] Update error for ${update.id}: ${error.message}`, "error");
          stats.failed++;
        } else {
          stats.updated++;
        }
      }
      log(`[DB] Updated ${stats.updated} records with phone numbers`, "success");
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`${"=".repeat(70)}`);
    log(`[SCRAPE COMPLETE] Duration: ${duration}s`, "success");
    log(
      `[RESULTS] Scraped: ${stats.scraped} | Inserted: ${stats.inserted} | Updated: ${stats.updated} | Duplicates: ${stats.duplicates} | Failed: ${stats.failed}`,
      "success",
    );
    log(`${"=".repeat(70)}`);

    cleanup();

    return NextResponse.json({
      success: true,
      message: `Scraped ${stats.scraped} in ${duration}s. Inserted: ${stats.inserted}, Updated: ${stats.updated}, Duplicates: ${stats.duplicates}, Failed: ${stats.failed}`,
      stats,
      sample,
    });
  } catch (error) {
    console.error("[FATAL ERROR]", error);
    loggerCleanup?.();
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        stats: { scraped: 0, inserted: 0, updated: 0, duplicates: 0, failed: 0 },
        sample: [],
      },
      { status: 500 },
    );
  }
}
