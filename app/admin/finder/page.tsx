"use client";

import { ScraperPanel } from "@/components/scraper-panel";

export default function ScraperPage() {
  const handleScrapeComplete = () => {
    // Scrape finished — user can navigate to dashboard to see results
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <ScraperPanel onScrapeComplete={handleScrapeComplete} />
    </main>
  );
}
