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
  Wallet,
  RefreshCw,
  MessageSquare,
  Star,
  Check,
} from "lucide-react";
import { Icon } from "@iconify/react";
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
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  rating: number | null;
  review_count: number;
}

interface SmsMessage {
  id: string;
  to: string;
  message: string;
  sender_id: string;
  status: string;
  cost: number | null;
  created_at: string;
  sent_at: string | null;
}

type FilterTab = "not_sent" | "sent" | "all";

const PAGE_SIZE = 500;
const MSG_PAGE_SIZE = 25;

export function PhoneSender() {
  const [businesses, setBusinesses] = useState<PhoneBusiness[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterTab>("not_sent");
  const [noWebsite, setNoWebsite] = useState(false);
  const [potentialClients, setPotentialClients] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const [singleSendBusiness, setSingleSendBusiness] = useState<PhoneBusiness | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/sms-messages?limit=${MSG_PAGE_SIZE}&page=${msgPage}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMessages(json.data || []);
      setMsgTotalPages(json.last_page || 1);
      setMsgTotal(json.total || 0);
    } catch (err) {
      toast.error(
        `Failed to load SMS history: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setMessagesLoading(false);
    }
  }, [msgPage]);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await fetch("/api/sms-balance");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setBalance(json);
    } catch (err) {
      toast.error(
        `Failed to load SMS balance: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/businesses/phone-list?filter=${filter}&page=${page}&limit=${PAGE_SIZE}&noWebsite=${noWebsite}&potentialClients=${potentialClients}`
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
  }, [filter, page, noWebsite, potentialClients]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, noWebsite, potentialClients]);

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
        fetchBalance();
        fetchMessages();
      }
    } catch (err) {
      toast.error(
        `Send failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsSent = async (businessId: string) => {
    setActionLoading(businessId);
    try {
      const res = await fetch("/api/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: businessId, sms_sent: true }),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(`Failed to mark as sent: ${result.error}`);
      } else {
        toast.success("Marked as sent");
        await fetchBusinesses();
      }
    } catch (err) {
      toast.error(
        `Failed to mark as sent: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendSingle = async () => {
    if (!singleSendBusiness) return;

    setActionLoading(singleSendBusiness.id);
    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIds: [singleSendBusiness.id] }),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(`SMS error: ${result.error}`);
      } else {
        if (result.sent > 0) {
          toast.success(`SMS sent successfully`);
        }
        if (result.failed > 0) {
          toast.error(`Failed to send SMS`);
        }
        await fetchBusinesses();
        fetchBalance();
        fetchMessages();
      }
    } catch (err) {
      toast.error(
        `Send failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setActionLoading(null);
      setSingleSendBusiness(null);
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
          <div className="flex items-center gap-1.5 ml-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            {balanceLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : balance ? (
              <span className="text-sm font-medium">
                {balance.balance.toFixed(2)} {balance.currency}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">--</span>
            )}
            <button
              onClick={fetchBalance}
              disabled={balanceLoading}
              className="p-0.5 rounded hover:bg-muted transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${balanceLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
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
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={potentialClients}
            onCheckedChange={(checked) => setPotentialClients(checked === true)}
          />
          Potential clients
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
                      <TableHead>Socials</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="sticky right-0 bg-background text-right pr-6 border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                        Actions
                      </TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {biz.instagram && (
                              <a
                                href={biz.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-700 transition-colors"
                                title="Instagram"
                              >
                                <Icon icon="mdi:instagram" className="h-4 w-4" />
                              </a>
                            )}
                            {biz.facebook && (
                              <a
                                href={biz.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="Facebook"
                              >
                                <Icon icon="mdi:facebook" className="h-4 w-4" />
                              </a>
                            )}
                            {biz.twitter && (
                              <a
                                href={biz.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-500 hover:text-sky-600 transition-colors"
                                title="Twitter"
                              >
                                <Icon icon="mdi:twitter" className="h-4 w-4" />
                              </a>
                            )}
                            {biz.linkedin && (
                              <a
                                href={biz.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-800 transition-colors"
                                title="LinkedIn"
                              >
                                <Icon icon="mdi:linkedin" className="h-4 w-4" />
                              </a>
                            )}
                            {!biz.instagram && !biz.facebook && !biz.twitter && !biz.linkedin && (
                              <span className="text-muted-foreground">{"\u2014"}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {biz.rating !== null || biz.review_count > 0 ? (
                            <div className="flex items-center gap-1.5">
                              {biz.rating !== null && (
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{biz.rating.toFixed(1)}</span>
                                </div>
                              )}
                              {biz.review_count > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  ({biz.review_count})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
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
                        <TableCell className="sticky right-0 bg-background text-right pr-6 border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsSent(biz.id)}
                              disabled={biz.sms_sent || actionLoading === biz.id || sending}
                              title="Mark as sent (database only)"
                            >
                              {actionLoading === biz.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSingleSendBusiness(biz)}
                              disabled={biz.sms_sent || actionLoading === biz.id || sending}
                              title="Send SMS"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* SMS History Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">SMS History</CardTitle>
              <Badge variant="secondary">{msgTotal} messages</Badge>
            </div>
            <button
              onClick={fetchMessages}
              disabled={messagesLoading}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Refresh messages"
            >
              <RefreshCw
                className={`h-4 w-4 text-muted-foreground ${messagesLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {messagesLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No messages found.
            </div>
          ) : (
            <>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="pl-6">To</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="pl-6 font-mono text-sm">
                          {msg.to}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[300px] truncate"
                          title={msg.message}
                        >
                          {msg.message}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {msg.sender_id || "\u2014"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              msg.status === "delivered"
                                ? "default"
                                : msg.status === "sent"
                                  ? "secondary"
                                  : msg.status === "failed" || msg.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {msg.cost != null ? `${msg.cost.toFixed(4)}` : "\u2014"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {msg.sent_at
                            ? new Date(msg.sent_at).toLocaleString()
                            : msg.created_at
                              ? new Date(msg.created_at).toLocaleString()
                              : "\u2014"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Messages pagination */}
              <div className="flex items-center justify-between px-6 pt-4 border-t mt-2">
                <p className="text-sm text-muted-foreground">
                  Page {msgPage} of {msgTotalPages} ({msgTotal} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMsgPage((p) => Math.max(1, p - 1))}
                    disabled={msgPage <= 1 || messagesLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMsgPage((p) => Math.min(msgTotalPages, p + 1))
                    }
                    disabled={msgPage >= msgTotalPages || messagesLoading}
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

      {/* Single SMS Send Dialog */}
      <AlertDialog open={!!singleSendBusiness} onOpenChange={(open) => !open && setSingleSendBusiness(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm SMS Send</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an SMS message to{" "}
              <strong>{singleSendBusiness?.name}</strong> at{" "}
              <strong>{singleSendBusiness?.phone}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === singleSendBusiness?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendSingle}
              disabled={actionLoading === singleSendBusiness?.id}
            >
              {actionLoading === singleSendBusiness?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
