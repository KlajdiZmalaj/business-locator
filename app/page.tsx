"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { ScraperPanel } from "@/components/scraper-panel";
import { BusinessesList } from "@/components/businesses-list";
import { StatsCards } from "@/components/stats-cards";
import { Business } from "@/lib/types";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const handleScrapeComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBusinessesLoaded = useCallback((loadedBusinesses: Business[]) => {
    setBusinesses(loadedBusinesses);
  }, []);

  const lastScrapeTime =
    businesses.length > 0
      ? businesses
          .reduce((latest, b) => {
            const scraped = new Date(b.scraped_at);
            return scraped > latest ? scraped : latest;
          }, new Date(0))
          .toISOString()
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar lastScrapeTime={lastScrapeTime} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards refreshTrigger={refreshTrigger} />

          {/* Main Content - Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Left Column - Scraper Panel */}
            <ScraperPanel onScrapeComplete={handleScrapeComplete} />

            {/* Right Column - Businesses List */}
            <BusinessesList refreshTrigger={refreshTrigger} onBusinessesLoaded={handleBusinessesLoaded} />
          </div>
        </div>
      </main>
    </div>
  );
}
