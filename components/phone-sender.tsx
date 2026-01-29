"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Phone,
  Send,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhoneBusiness {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  emails: string[];
  category_name: string | null;
  sms_sent: boolean;
  sms_sent_at: string | null;
}

type FilterTab = "not_sent" | "sent" | "all";

const PAGE_SIZE = 500;

export function PhoneSender() {
  const [businesses, setBusinesses] = useState<PhoneBusiness[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterTab>("not_sent");
  const [noWebsite, setNoWebsite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/businesses/phone-list?filter=${filter}&page=${page}&limit=${PAGE_SIZE}&noWebsite=${noWebsite}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setBusinesses(json.data);
      setTotalPages(json.totalPages || 1);
      setTotal(json.total || 0);
      setSelected(new Set());
    } catch (err) {
      toast.error(
        `Failed to load businesses: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, noWebsite]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, noWebsite]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === businesses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(businesses.map((b) => b.id)));
    }
  };

  const handleSend = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    setSending(true);
    setProgress({ sent: 0, total: ids.length });

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIds: ids }),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(`SMS error: ${result.error}`);
      } else {
        setProgress({ sent: result.sent, total: ids.length });
        if (result.sent > 0) {
          toast.success(`Successfully sent ${result.sent} messages`);
        }
        if (result.failed > 0) {
          toast.error(`Failed to send ${result.failed} messages`);
        }
        await fetchBusinesses();
      }
    } catch (err) {
      toast.error(
        `Send failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSending(false);
    }
  };

  const filterTabs: { label: string; value: FilterTab }[] = [
    { label: "Not Sent", value: "not_sent" },
    { label: "Sent", value: "sent" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Phone / SMS Management</h2>
          <Badge variant="secondary">{total} businesses</Badge>
        </div>

        {selected.size > 0 && !sending && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send to {selected.size} selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm SMS Send</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to send SMS messages to{" "}
                  <strong>{selected.size}</strong> businesses. Messages will be
                  sent with 5-second delays between each. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSend}>
                  Send Messages
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Sending progress */}
      {sending && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">
                  Sending messages... {progress.sent}/{progress.total}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait. Messages are sent with 5-second intervals.
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${progress.total > 0 ? (progress.sent / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={noWebsite}
            onCheckedChange={(checked) => setNoWebsite(checked === true)}
          />
          No website only
        </label>
      </div>

      {/* Business table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Businesses with Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No businesses found for this filter.
            </div>
          ) : (
            <>
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-12 pl-6">
                        <Checkbox
                          checked={
                            businesses.length > 0 &&
                            selected.size === businesses.length
                          }
                          onCheckedChange={toggleAll}
                          disabled={sending}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((biz) => (
                      <TableRow key={biz.id}>
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selected.has(biz.id)}
                            onCheckedChange={() => toggleSelect(biz.id)}
                            disabled={sending}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {biz.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {biz.phone || "\u2014"}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {biz.website ? (
                            <a
                              href={biz.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {biz.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          ) : (
                            "\u2014"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {biz.emails?.[0] || "\u2014"}
                        </TableCell>
                        <TableCell>
                          {biz.category_name ? (
                            <Badge variant="secondary">
                              {biz.category_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              {"\u2014"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {biz.sms_sent ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Sent</span>
                            </div>
                          ) : (
                            <Badge variant="outline">Not sent</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 pt-4 border-t mt-2">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
