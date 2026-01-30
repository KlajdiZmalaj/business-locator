"use client";

import { useState, useCallback } from "react";
import { BusinessesList } from "@/components/businesses-list";
import { StatsCards } from "@/components/stats-cards";
import { Business } from "@/lib/types";

export default function AdminDashboard() {
  const [refreshTrigger] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const handleBusinessesLoaded = useCallback((loadedBusinesses: Business[]) => {
    setBusinesses(loadedBusinesses);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <StatsCards refreshTrigger={refreshTrigger} />
        <BusinessesList
          refreshTrigger={refreshTrigger}
          onBusinessesLoaded={handleBusinessesLoaded}
        />
      </div>
    </main>
  );
}
