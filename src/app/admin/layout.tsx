"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart,
  Users,
  MapPin,
  Ticket,
  ShoppingCart,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the current page is login or init page
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/init";

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for login and init pages
      if (isAuthPage) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify authentication
        const response = await fetch("/api/admin/check-auth");
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          // Redirect to login if not authenticated
          router.push("/admin/login");
          return;
        }

        // Set user data
        setUser(data.user);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router, pathname, isAuthPage]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Redirect to login page
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // If it's an auth page (login or init), just render the children without admin layout
  if (isAuthPage) {
    return <div className="admin-auth-layout">{children}</div>;
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Hide all elements from the root layout */}
      <style jsx global>{`
        body > header,
        body > footer {
          display: none;
        }
        body > main {
          padding: 0;
          margin: 0;
          display: flex;
          flex: 1;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        html,
        body {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
      `}</style>

      {/* Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 flex-col border-r bg-muted/40 p-6 md:flex">
        <div className="flex h-14 items-center border-b">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <div className="my-4 px-2 py-2 bg-muted/60 rounded-md">
          <p className="text-sm font-medium">{user?.name || "Admin"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1 bg-primary/10 text-primary px-2 py-1 rounded inline-block">
            {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Pariwisata"}
          </p>
        </div>
        <nav className="flex-1 pt-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/dashboard")}
            >
              <div className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/users")}
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Pengguna</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/destinations")}
            >
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Destinasi</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/tickets")}
            >
              <div className="flex items-center">
                <Ticket className="mr-2 h-4 w-4" />
                <span>Tiket</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/orders")}
            >
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Pesanan</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/complaints")}
            >
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Komplain</span>
              </div>
            </Button>
          </div>
        </nav>
        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile header and main content */}
      <div className="flex flex-1 flex-col w-full overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const sidebar = document.getElementById("mobile-sidebar");
                if (sidebar) {
                  sidebar.classList.toggle("hidden");
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <div className="font-semibold">DolanBumen Admin</div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile sidebar - hidden by default */}
        <div
          id="mobile-sidebar"
          className="md:hidden hidden w-64 absolute z-40 top-16 left-0 bottom-0 bg-background border-r"
        >
          <div className="px-4 py-4">
            <div className="my-4 px-2 py-2 bg-muted/60 rounded-md">
              <p className="text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1 bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                {user?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : "Admin Pariwisata"}
              </p>
            </div>
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/dashboard")}
              >
                <BarChart className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Pengguna</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/destinations")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>Destinasi</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/tickets")}
              >
                <Ticket className="mr-2 h-4 w-4" />
                <span>Tiket</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/orders")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Pesanan</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/complaints")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Komplain</span>
              </Button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 w-full overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
