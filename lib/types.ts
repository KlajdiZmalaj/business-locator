export interface Business {
  id: string;
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
  search_query: string | null;
  scraped_at: string;
  created_at: string;

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

  // Business status
  permanently_closed: boolean;
  temporarily_closed: boolean;

  // Google identifiers
  place_id: string | null;
  cid: string | null;

  // Media
  images_count: number;
  image_url: string | null;

  // Hotel specific
  hotel_stars: string | null;

  // Contact arrays
  emails: string[];
  phones: string[];

  // Social media
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
  linkedin: string | null;
  whatsapp: string | null;

  // Additional
  domain: string | null;
  opening_hours: { day: string; hours: string }[];
  additional_info: Record<string, unknown>;
}

export interface ScrapeRequest {
  searchQuery: string;
  lat: number;
  lng: number;
  limit: number;
  skipDuplicates: boolean;
}

export interface ScrapeResponse {
  success: boolean;
  message: string;
  stats: {
    scraped: number;
    inserted: number;
    updated: number;
    duplicates: number;
    failed: number;
  };
  sample: Partial<Business>[];
}

export interface BusinessesResponse {
  data: Business[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ScrapedBusiness {
  name?: string;
  phone?: string;
  phone_unformatted?: string;
  reviews?: number;
  rating?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  maps_url?: string;

  // Extended fields
  price?: string;
  category_name?: string;
  categories?: string[];
  neighborhood?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country_code?: string;

  // Business status
  permanently_closed?: boolean;
  temporarily_closed?: boolean;

  // Google identifiers
  place_id?: string;
  cid?: string;

  // Media
  images_count?: number;
  image_url?: string;

  // Hotel specific
  hotel_stars?: string;

  // Contact arrays
  emails?: string[];
  phones?: string[];

  // Social media
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;

  // Additional
  domain?: string;
  opening_hours?: any[];
  additional_info?: Record<string, unknown>;
}
