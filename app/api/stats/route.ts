import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface StatsResponse {
  totalBusinesses: number;
  avgRating: number;
  totalReviews: number;
  topRated: {
    name: string;
    rating: number;
  } | null;
  withPhone: number;
  withEmail: number;
  withWebsite: number;
  withSocial: number;
  closedCount: number;
  topCategories: { name: string; count: number }[];
}

export async function GET(): Promise<NextResponse<StatsResponse | { error: string }>> {
  try {
    const supabase = getSupabaseAdmin();

    // Get total count
    const { count: totalBusinesses } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true });

    // Get average rating
    const { data: ratingData } = await supabase
      .from("businesses")
      .select("rating")
      .not("rating", "is", null);

    let avgRating = 0;
    if (ratingData && ratingData.length > 0) {
      avgRating = ratingData.reduce((sum, b) => sum + (b.rating || 0), 0) / ratingData.length;
    }

    // Get total reviews
    const { data: reviewData } = await supabase
      .from("businesses")
      .select("review_count");

    const totalReviews = reviewData?.reduce((sum, b) => sum + (b.review_count || 0), 0) || 0;

    // Get top rated business
    const { data: topRatedData } = await supabase
      .from("businesses")
      .select("name, rating")
      .not("rating", "is", null)
      .order("rating", { ascending: false })
      .order("review_count", { ascending: false })
      .limit(1);

    const topRated = topRatedData?.[0]
      ? { name: topRatedData[0].name, rating: topRatedData[0].rating }
      : null;

    // Get count with phone
    const { count: withPhone } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .not("phone", "is", null);

    // Get count with email (emails array not empty)
    const { data: emailData } = await supabase
      .from("businesses")
      .select("emails")
      .not("emails", "eq", "[]");

    const withEmail = emailData?.filter(b => b.emails && Array.isArray(b.emails) && b.emails.length > 0).length || 0;

    // Get count with website
    const { count: withWebsite } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .not("website", "is", null);

    // Get count with any social media
    const { data: socialData } = await supabase
      .from("businesses")
      .select("instagram, facebook, twitter, youtube, tiktok, linkedin, whatsapp");

    const withSocial = socialData?.filter(b =>
      b.instagram || b.facebook || b.twitter || b.youtube || b.tiktok || b.linkedin || b.whatsapp
    ).length || 0;

    // Get closed businesses count
    const { count: closedCount } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .or("permanently_closed.eq.true,temporarily_closed.eq.true");

    // Get top categories
    const { data: categoryData } = await supabase
      .from("businesses")
      .select("category_name")
      .not("category_name", "is", null);

    const categoryCounts = new Map<string, number>();
    categoryData?.forEach(b => {
      if (b.category_name) {
        categoryCounts.set(b.category_name, (categoryCounts.get(b.category_name) || 0) + 1);
      }
    });

    const topCategories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalBusinesses: totalBusinesses || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      topRated,
      withPhone: withPhone || 0,
      withEmail,
      withWebsite: withWebsite || 0,
      withSocial,
      closedCount: closedCount || 0,
      topCategories,
    });
  } catch (error) {
    console.error("[Stats] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
