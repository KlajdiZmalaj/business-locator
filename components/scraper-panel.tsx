"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrapeResponse } from "@/lib/types";
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, MapPin, Map } from "lucide-react";
import { toast } from "sonner";

interface ScraperPanelProps {
  onScrapeComplete: () => void;
}

const QUICK_TEMPLATES = [
  "restaurant",
  "cafe",
  "pizza",
  "bar",
  "hotel",
  "pharmacy",
  "gym",
  "bank",
  "supermarket",
  "dentist",
  "doctor",
  "lawyer",
  "hair salon",
  "car wash",
  "mechanic",
  "bakery",
];

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

export function ScraperPanel({ onScrapeComplete }: ScraperPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("Tirana, Albania");
  const [useNeighborhoods, setUseNeighborhoods] = useState(false);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<number[]>([0, 1, 2, 3, 4]);
  const [limit, setLimit] = useState([100]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);

  const toggleNeighborhood = (index: number) => {
    setSelectedNeighborhoods((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const selectAllNeighborhoods = () => {
    setSelectedNeighborhoods(TIRANA_NEIGHBORHOODS.map((_, i) => i));
  };

  const clearNeighborhoods = () => {
    setSelectedNeighborhoods([]);
  };

  const handleScrape = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    if (useNeighborhoods && selectedNeighborhoods.length === 0) {
      toast.error("Please select at least one neighborhood");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/scrape-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQuery: searchQuery.trim(),
          city,
          useNeighborhoods,
          selectedNeighborhoods,
          maxResults: limit[0],
          skipDuplicates,
        }),
      });

      const data: ScrapeResponse = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(data.message);
        onScrapeComplete();
      } else {
        toast.error(data.message || "Finding failed");
      }
    } catch (error) {
      toast.error("Failed to scrape businesses");
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        stats: { scraped: 0, inserted: 0, updated: 0, duplicates: 0, failed: 0 },
        sample: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // With Apify: 1 search per neighborhood, or 1 city-wide search
  const estimatedSearches = useNeighborhoods ? selectedNeighborhoods.length : 1;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Scraper
        </CardTitle>
        <CardDescription>Scrape businesses from Google Maps via Apify</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Business Type</Label>
          <Input
            id="search-query"
            placeholder="e.g., restaurant, cafe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex flex-wrap gap-1">
            {QUICK_TEMPLATES.map((template) => (
              <Badge
                key={template}
                variant={searchQuery === template ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                onClick={() => !isLoading && setSearchQuery(template)}
              >
                {template}
              </Badge>
            ))}
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
        </div>

        {/* Neighborhood Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-neighborhoods"
                checked={useNeighborhoods}
                onCheckedChange={(checked) => setUseNeighborhoods(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="use-neighborhoods" className="flex items-center gap-1">
                <Map className="h-4 w-4" />
                Search by neighborhoods
              </Label>
            </div>
            {useNeighborhoods && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllNeighborhoods}
                  disabled={isLoading}
                  className="h-6 text-xs px-2"
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNeighborhoods}
                  disabled={isLoading}
                  className="h-6 text-xs px-2"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {useNeighborhoods && (
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto p-1 border rounded">
              {TIRANA_NEIGHBORHOODS.map((neighborhood, index) => (
                <Button
                  key={index}
                  variant={selectedNeighborhoods.includes(index) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleNeighborhood(index)}
                  disabled={isLoading}
                  className="h-6 text-xs justify-start px-2"
                >
                  {neighborhood}
                </Button>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {useNeighborhoods
              ? `${selectedNeighborhoods.length} neighborhoods = ${estimatedSearches} search queries`
              : `City-wide search = ${estimatedSearches} search query`}
          </p>
        </div>

        {/* Result Limit */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Max results</Label>
            <span className="text-sm text-muted-foreground">{limit[0]}</span>
          </div>
          <Slider value={limit} onValueChange={setLimit} min={10} max={10000} step={10} disabled={isLoading} />
        </div>

        {/* Skip Duplicates */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="skip-duplicates"
            checked={skipDuplicates}
            onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
            disabled={isLoading}
          />
          <Label htmlFor="skip-duplicates" className="text-sm">
            Skip duplicates
          </Label>
        </div>

        {/* Scrape Button */}
        <Button
          onClick={handleScrape}
          disabled={isLoading || !searchQuery.trim() || (useNeighborhoods && selectedNeighborhoods.length === 0)}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding... (check console for progress)
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Start Finding
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium text-sm">{result.success ? "Complete" : "Failed"}</span>
            </div>

            {!result.success && <p className="text-xs text-red-600">{result.message}</p>}

            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="text-center p-2 rounded bg-muted">
                <div className="font-bold">{result.stats.scraped}</div>
                <div className="text-muted-foreground">Found</div>
              </div>
              <div className="text-center p-2 rounded bg-green-50 dark:bg-green-950">
                <div className="font-bold text-green-600">{result.stats.inserted}</div>
                <div className="text-muted-foreground">New</div>
              </div>
              <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-950">
                <div className="font-bold text-blue-600">{result.stats.updated}</div>
                <div className="text-muted-foreground">Updated</div>
              </div>
              <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-950">
                <div className="font-bold text-yellow-600">{result.stats.duplicates}</div>
                <div className="text-muted-foreground">Dups</div>
              </div>
              <div className="text-center p-2 rounded bg-red-50 dark:bg-red-950">
                <div className="font-bold text-red-600">{result.stats.failed}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>

            {result.sample.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Sample
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {result.sample.map((b, i) => (
                    <div key={i} className="p-1.5 rounded border bg-muted/50">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-muted-foreground">
                        {[b.rating && `${b.rating}★`, b.phone].filter(Boolean).join(" | ") || "No details"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
