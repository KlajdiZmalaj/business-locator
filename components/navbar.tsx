"use client";

import { MapPin, Database } from "lucide-react";

interface NavbarProps {
  lastScrapeTime: string | null;
}

export function Navbar({ lastScrapeTime }: NavbarProps) {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Business Locator</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
            </div>

            {lastScrapeTime && (
              <div className="text-sm text-muted-foreground">
                Last scrape: {new Date(lastScrapeTime).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
