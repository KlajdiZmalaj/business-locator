'use client';

import { MapPin } from 'lucide-react';

interface MapPreviewProps {
  lat: number;
  lng: number;
}

export function MapPreview({ lat, lng }: MapPreviewProps) {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-lg border bg-muted">
      {/* Simple map visualization */}
      <svg
        viewBox="0 0 200 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
          </pattern>
        </defs>
        <rect width="200" height="100" fill="url(#grid)" />

        {/* Roads */}
        <line
          x1="0"
          y1="50"
          x2="200"
          y2="50"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/30"
        />
        <line
          x1="100"
          y1="0"
          x2="100"
          y2="100"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/30"
        />

        {/* Search radius */}
        <circle
          cx="100"
          cy="50"
          r="30"
          fill="currentColor"
          className="text-primary/10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Center marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <MapPin className="h-8 w-8 text-primary" fill="currentColor" />
      </div>

      {/* Coordinates label */}
      <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-mono backdrop-blur">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  );
}
