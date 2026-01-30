"use client";

import Link from "next/link";
import {
  Search,
  Mail,
  Phone,
  ArrowRight,
  MapPin,
  BarChart3,
  Zap,
  Database,
  FileSpreadsheet,
  Shield,
  Globe,
  Radio,
  ChevronRight,
  CheckCircle2,
  Building2,
  Users,
  Star,
  Layers,
  Bot,
  ShieldCheck,
  Network,
  Fingerprint,
  ServerCrash,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Search,
    title: "Smart Discovery",
    description:
      "Our proprietary crawler navigates Google Maps like a real user -- by category, keyword, and neighborhood. 27 Tirana zones covered automatically.",
  },
  {
    icon: Database,
    title: "Structured Data",
    description:
      "35+ data points per business: phone, email, address, ratings, social links, opening hours, and more -- all extracted and normalized in real time.",
  },
  {
    icon: Radio,
    title: "Real-time Logs",
    description:
      "Watch every crawl step live with WebSocket-powered log streaming. Full visibility into proxy rotation, page loads, and extraction progress.",
  },
  {
    icon: Mail,
    title: "Email Outreach",
    description:
      "Send templated emails directly to businesses with verified email addresses from your dashboard. Personalized at scale.",
  },
  {
    icon: Phone,
    title: "SMS Campaigns",
    description: "Reach businesses via SMS using collected phone numbers. Track delivery and balance in real time.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Export",
    description:
      "Export filtered business data to XLSX with 30+ columns. Apply filters before export for targeted lists.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Define Your Search",
    description:
      "Pick a business category, target city, and optionally select specific neighborhoods to narrow your search.",
  },
  {
    step: "02",
    title: "Crawl & Collect",
    description:
      "Our headless Chromium engine spins up browser instances behind rotating proxies, bypasses CAPTCHAs, and extracts data in real time.",
  },
  {
    step: "03",
    title: "Review & Filter",
    description:
      "Browse results in a sortable, filterable table. Expand rows for full details including social links and hours.",
  },
  {
    step: "04",
    title: "Reach Out",
    description:
      "Send emails or SMS to your filtered list directly from the dashboard. Export to Excel for external tools.",
  },
];

const engineLayers = [
  {
    icon: Layers,
    title: "Headless Chromium",
    description:
      "Full browser rendering via Playwright-powered Chromium instances. JavaScript-heavy pages render exactly as a real user sees them.",
  },
  {
    icon: Network,
    title: "Rotating Proxy Mesh",
    description:
      "Requests route through a pool of 10,000+ residential and datacenter proxies across 50+ geolocations. Automatic failover and IP rotation.",
  },
  {
    icon: ShieldCheck,
    title: "CAPTCHA Solver",
    description:
      "Built-in ML-powered CAPTCHA recognition handles reCAPTCHA v2/v3, hCaptcha, and image challenges without manual intervention.",
  },
  {
    icon: Fingerprint,
    title: "Browser Fingerprint Randomization",
    description:
      "Each session generates unique fingerprints -- user-agent, viewport, WebGL hash, canvas, and timezone -- to avoid detection.",
  },
  {
    icon: Bot,
    title: "Human-like Behavior Engine",
    description:
      "Realistic mouse movements, scroll patterns, random delays, and click sequences that mimic organic user behavior.",
  },
  {
    icon: ServerCrash,
    title: "Auto-retry & Rate Limiting",
    description:
      "Intelligent backoff algorithms detect throttling and automatically retry with fresh sessions. Zero data loss on transient failures.",
  },
];

const stats = [
  { value: "27", label: "Neighborhoods", icon: MapPin },
  { value: "35+", label: "Data Points", icon: BarChart3 },
  { value: "10K+", label: "Proxy Pool", icon: Network },
  { value: "99.8%", label: "Success Rate", icon: Shield },
];

const techStack = [
  { name: "Next.js 16", icon: "logos:nextjs-icon" },
  { name: "React 19", icon: "logos:react" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "Playwright", icon: "logos:playwright" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
  { name: "Node.js", icon: "logos:nodejs-icon-alt" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Icon icon="game-icons:metal-hand" className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Skrrapi iProPixel</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <a href="#how-it-works">How it works</a>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
              <a href="#engine">Engine</a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="container mx-auto px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
                Works in any city, any country -- battle-tested in Tirana
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Find, Collect & Reach{" "}
                <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Local Businesses
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                Our custom-built crawling engine extracts business data from Google Maps at scale, organizes it in a
                powerful dashboard, and lets you launch email or SMS outreach -- all from one place.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <a href="#features">
                    Learn More
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Hero visual - mock dashboard */}
            <div className="mx-auto mt-16 max-w-4xl sm:mt-20">
              <div className="rounded-xl border bg-card p-1 shadow-2xl ring-1 ring-border/50">
                <div className="rounded-lg bg-muted/30 p-4 sm:p-6">
                  {/* Mock top bar */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                    <div className="h-3 w-3 rounded-full bg-green-400/60" />
                    <div className="ml-4 h-5 flex-1 rounded-md bg-muted/60" />
                  </div>
                  {/* Mock stat cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Total Businesses", value: "2,847" },
                      { label: "With Phone", value: "1,923" },
                      { label: "With Email", value: "864" },
                      { label: "Avg Rating", value: "4.3" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border bg-background p-3">
                        <p className="text-[10px] text-muted-foreground sm:text-xs">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold sm:text-xl">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mock table rows */}
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-md border bg-background p-3">
                        <div className="h-8 w-8 rounded-md bg-muted" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 rounded bg-muted" style={{ width: `${60 + i * 10}%` }} />
                          <div className="h-2 rounded bg-muted/60" style={{ width: `${40 + i * 8}%` }} />
                        </div>
                        <div className="hidden gap-1 sm:flex">
                          <div className="h-6 w-14 rounded bg-primary/10" />
                          <div className="h-6 w-14 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to find and reach businesses
              </h2>
              <p className="mt-4 text-muted-foreground">
                From discovery to outreach, Skrrapi gives you a complete pipeline for local business data.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group relative transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-t bg-muted/20">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Workflow
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground">Four simple steps from search to outreach.</p>
            </div>
            <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item, index) => (
                <div key={item.step} className="relative">
                  {index < workflow.length - 1 && (
                    <div
                      className="absolute right-0 top-8 hidden h-px w-6 bg-border lg:block"
                      style={{ right: "-12px" }}
                    />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="mb-3 text-4xl font-black text-primary/15">{item.step}</span>
                    <h3 className="mb-2 text-sm font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Engine infrastructure */}
        <section id="engine" className="scroll-mt-20 border-t">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4">
                Under the Hood
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Enterprise-grade crawling infrastructure
              </h2>
              <p className="mt-4 text-muted-foreground">
                Six proprietary layers work together to deliver undetectable, reliable, and blazing-fast data extraction
                from Google Maps.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {engineLayers.map((layer) => (
                <Card key={layer.title} className="group relative border-dashed transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <layer.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{layer.title}</CardTitle>
                    <CardDescription>{layer.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data points showcase */}
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="outline" className="mb-4">
                  Rich Data
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">35+ data points per business</h2>
                <p className="mt-4 text-muted-foreground">
                  Our Chromium-based extraction pipeline normalizes every field into clean, structured data ready for
                  filtering, export, and outreach.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    "Name & Category",
                    "Phone & Email",
                    "Full Address",
                    "Ratings & Reviews",
                    "Website & Domain",
                    "Social Media Links",
                    "Opening Hours",
                    "GPS Coordinates",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {/* Mock business card */}
                <Card>
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <p className="font-semibold">Coffee House Tirana</p>
                          <p className="text-xs text-muted-foreground">Rruga Myslym Shyri, Blloku, Tirana</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            <Star className="mr-0.5 h-2.5 w-2.5" />
                            4.5
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Users className="mr-0.5 h-2.5 w-2.5" />
                            312 reviews
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Phone className="mr-0.5 h-2.5 w-2.5" />
                            +355 69...
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Mail className="mr-0.5 h-2.5 w-2.5" />
                            info@...
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Icon icon="mdi:instagram" className="h-4 w-4 text-muted-foreground" />
                          <Icon icon="mdi:facebook" className="h-4 w-4 text-muted-foreground" />
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <p className="font-semibold">Digital Agency AL</p>
                          <p className="text-xs text-muted-foreground">Rruga Bardhyl, Komuna e Parisit, Tirana</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            <Star className="mr-0.5 h-2.5 w-2.5" />
                            4.8
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Users className="mr-0.5 h-2.5 w-2.5" />
                            89 reviews
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Phone className="mr-0.5 h-2.5 w-2.5" />
                            +355 44...
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Icon icon="mdi:linkedin" className="h-4 w-4 text-muted-foreground" />
                          <Icon icon="mdi:facebook" className="h-4 w-4 text-muted-foreground" />
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-sm font-medium text-muted-foreground">Built with modern technologies</p>
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon icon={tech.icon} className="h-5 w-5" />
                  <span className="text-sm font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="container mx-auto px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-lg sm:p-12">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon icon="game-icons:metal-hand" className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to start scraping?</h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Sign in to your admin dashboard and start discovering businesses in any city around the world.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Sign in to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Icon icon="game-icons:metal-hand" className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Skrrapi iProPixel</span>
          </div>
          <p className="text-xs text-muted-foreground">Google Maps business scraper -- works worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
