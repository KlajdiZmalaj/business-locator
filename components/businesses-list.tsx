"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Business, BusinessesResponse } from "@/lib/types";
import {
  Building2,
  Phone,
  Star,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  ExternalLink,
  Inbox,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPinned,
  Image,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";

interface BusinessesListProps {
  refreshTrigger: number;
  onBusinessesLoaded: (businesses: Business[]) => void;
}

export function BusinessesList({ refreshTrigger, onBusinessesLoaded }: BusinessesListProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [nameFilter, setNameFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(nameFilter && { name: nameFilter }),
      });

      const response = await fetch(`/api/businesses?${params}`);
      const data: BusinessesResponse = await response.json();

      setBusinesses(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      onBusinessesLoaded(data.data || []);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortOrder, nameFilter, onBusinessesLoaded]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses, refreshTrigger]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setNameFilter(value);
    setPage(1);
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const SocialLink = ({ url, icon: Icon, label }: { url: string | null; icon: React.ElementType; label: string }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        title={label}
      >
        <Icon className="h-4 w-4" />
      </a>
    );
  };

  const DetailRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
  }) => {
    if (!value || (typeof value === "string" && !value.trim())) return null;
    return (
      <div className="flex items-start gap-2 text-sm">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
        <span className="text-muted-foreground shrink-0">{label}:</span>
        <span className="font-medium break-all">{value}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Businesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Businesses
            </CardTitle>
            <CardDescription>{total} total businesses found</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={nameFilter}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 pl-8"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="review_count">Reviews</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No businesses found</h3>
            <p className="text-sm text-muted-foreground mt-1">Start by finding some businesses from Google Maps</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="w-[220px]">
                      <SortableHeader column="name">Name</SortableHeader>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                    </TableHead>
                    <TableHead>
                      <SortableHeader column="rating">
                        <Star className="h-4 w-4 mr-1" />
                        Rating
                      </SortableHeader>
                    </TableHead>
                    <TableHead>
                      <SortableHeader column="review_count">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reviews
                      </SortableHeader>
                    </TableHead>
                    <TableHead>Social</TableHead>
                    <TableHead>Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => (
                    <React.Fragment key={business.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRowExpansion(business.id)}
                      >
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {expandedRows.has(business.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="truncate max-w-[200px]" title={business.name}>
                              {business.name}
                            </span>
                            {(business.permanently_closed || business.temporarily_closed) && (
                              <Badge variant="destructive" className="w-fit text-xs">
                                {business.permanently_closed ? "Permanently Closed" : "Temporarily Closed"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {business.category_name ? (
                            <Badge variant="outline" className="text-xs">
                              {business.category_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {business.phone ? (
                            <a
                              href={`tel:${business.phone}`}
                              className="hover:underline text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {business.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{renderStars(business.rating)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{business.review_count?.toLocaleString() || 0}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <SocialLink url={business.instagram} icon={Instagram} label="Instagram" />
                            <SocialLink url={business.facebook} icon={Facebook} label="Facebook" />
                            <SocialLink url={business.twitter} icon={Twitter} label="Twitter" />
                            <SocialLink url={business.youtube} icon={Youtube} label="YouTube" />
                            {business.whatsapp && (
                              <a
                                href={business.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-green-600 transition-colors"
                                title="WhatsApp"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {business.website && (
                              <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                title="Website"
                              >
                                <Globe className="h-4 w-4" />
                              </a>
                            )}
                            {business.maps_url && (
                              <a
                                href={business.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                title="Google Maps"
                              >
                                <MapPinned className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details Row */}
                      {expandedRows.has(business.id) && (
                        <TableRow key={`${business.id}-details`} className="bg-muted/30">
                          <TableCell colSpan={8} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                              {/* Location & Contact */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Location & Contact
                                </h4>
                                <div className="space-y-2 pl-6">
                                  <DetailRow label="Address" value={business.address} />
                                  <DetailRow label="Street" value={business.street} />
                                  <DetailRow label="City" value={business.city} />
                                  <DetailRow label="Postal Code" value={business.postal_code} />
                                  <DetailRow label="Country" value={business.country_code} />
                                  <DetailRow label="Phone" value={business.phone} icon={Phone} />
                                  {business.emails && business.emails.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <span className="text-muted-foreground">Emails:</span>
                                      <div className="flex flex-col gap-1">
                                        {business.emails.map((email, i) => (
                                          <a key={i} href={`mailto:${email}`} className="text-primary hover:underline">
                                            {email}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {business.phones && business.phones.length > 1 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <span className="text-muted-foreground">All Phones:</span>
                                      <span>{business.phones.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Business Info */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  Business Info
                                </h4>
                                <div className="space-y-2 pl-6">
                                  <DetailRow label="Category" value={business.category_name} />
                                  {business.categories && business.categories.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-muted-foreground">Categories:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {business.categories.map((cat, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {cat}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <DetailRow label="Price" value={business.price} />
                                  <DetailRow label="Hotel Stars" value={business.hotel_stars} />
                                  <DetailRow label="Domain" value={business.domain} icon={Globe} />
                                  <DetailRow
                                    label="Images"
                                    value={business.images_count ? `${business.images_count} photos` : null}
                                    icon={Image}
                                  />
                                  <DetailRow label="Search Query" value={business.search_query} />
                                </div>
                              </div>

                              {/* IDs & Status */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  Status & IDs
                                </h4>
                                <div className="space-y-2 pl-6">
                                  <DetailRow label="Place ID" value={business.place_id} />
                                  <DetailRow label="CID" value={business.cid} />
                                  <DetailRow
                                    label="Status"
                                    value={
                                      business.permanently_closed ? (
                                        <Badge variant="destructive">Permanently Closed</Badge>
                                      ) : business.temporarily_closed ? (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                          Temporarily Closed
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="border-green-500 text-green-600">
                                          Open
                                        </Badge>
                                      )
                                    }
                                  />
                                  <DetailRow
                                    label="Scraped"
                                    value={
                                      business.scraped_at ? new Date(business.scraped_at).toLocaleDateString() : null
                                    }
                                    icon={Clock}
                                  />
                                </div>

                                {/* Image Preview */}
                                {business.image_url && (
                                  <div className="mt-4">
                                    <img
                                      src={business.image_url}
                                      alt={business.name}
                                      className="w-[200px] h-32 object-cover rounded-md"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Opening Hours */}
                            {business.opening_hours && business.opening_hours.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4" />
                                  Opening Hours
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  {(business.opening_hours as { day: string; hours: string }[]).map((item, i) => (
                                    <div key={i} className="text-muted-foreground">
                                      <span className="font-medium">{item.day}:</span> {item.hours}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
