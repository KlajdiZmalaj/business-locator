'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Share2,
  AlertTriangle,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface Stats {
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

interface StatsCardsProps {
  refreshTrigger?: number;
}

export function StatsCards({ refreshTrigger }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [refreshTrigger]);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const phonePercentage = stats.totalBusinesses > 0
    ? Math.round((stats.withPhone / stats.totalBusinesses) * 100)
    : 0;

  const emailPercentage = stats.totalBusinesses > 0
    ? Math.round((stats.withEmail / stats.totalBusinesses) * 100)
    : 0;

  const socialPercentage = stats.totalBusinesses > 0
    ? Math.round((stats.withSocial / stats.totalBusinesses) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.closedCount > 0 && (
                <span className="text-yellow-600">{stats.closedCount} closed</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.avgRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              across all businesses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalBusinesses > 0
                ? `~${Math.round(stats.totalReviews / stats.totalBusinesses)} per business`
                : 'No businesses yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={stats.topRated?.name}>
              {stats.topRated?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topRated?.rating ? `${stats.topRated.rating} stars` : 'No ratings'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact & Social Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withPhone.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${phonePercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{phonePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withEmail.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${emailPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{emailPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Website</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.withWebsite.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalBusinesses > 0
                ? `${Math.round((stats.withWebsite / stats.totalBusinesses) * 100)}% have websites`
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Social Media</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.withSocial.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${socialPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{socialPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topCategories.map((cat, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {cat.name}
                  <span className="ml-1 text-muted-foreground">({cat.count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
