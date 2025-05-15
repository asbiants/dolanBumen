"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BarChart, Users, MapPin, Ticket, ShoppingCart, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
      <AdminSidebar user={user} onLogout={handleLogout} router={router} />
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <div className="font-semibold">DolanBumen Admin</div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        {/* Main content */}
        <div className="flex-1 w-full overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
