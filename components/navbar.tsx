"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Search, Mail, Phone, LogOut } from "lucide-react";
import { Icon } from "@iconify/react";
import { getSupabaseBrowser } from "@/lib/supabase-client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/finder", label: "Finder", icon: Search },
    { href: "/admin/email", label: "Email", icon: Mail },
    { href: "/admin/phone", label: "Phone", icon: Phone },
  ];

  const handleLogout = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Icon icon="game-icons:metal-hand" className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Skrrapi iProPixel</span>
            </Link>

            <div className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
