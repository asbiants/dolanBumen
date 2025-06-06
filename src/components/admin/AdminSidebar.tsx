import { BarChart, Users, MapPin, Ticket, ShoppingCart, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string;
}

interface AdminSidebarProps {
  user: User | null;
  onLogout: () => void;
  router: any;
  pathname: string;
}

export default function AdminSidebar({ user, onLogout, router, pathname }: AdminSidebarProps) {
  // Helper untuk cek active
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const menus = [
    { href: "/admin/dashboard", icon: BarChart, label: "Dashboard" },
    { href: "/admin/destination-categories", icon: MapPin, label: "Kategori Wisata" },
    { href: "/admin/tourist-destinations", icon: MapPin, label: "Destinasi Wisata" },
    { href: "/admin/management-ticket", icon: Ticket, label: "Transaksi E-Ticket" },
    { href: "/admin/management-visitors", icon: ShoppingCart, label: "Daftar Pengunjung", customActive: () => isActive("/admin/management-visitors") && !isActive("/admin/management-visitors/per-destination") },
    { href: "/admin/management-visitors/per-destination", icon: BarChart, label: "Monitoring Kunjungan" },
    { href: "/admin/pengaduan-admin", icon: MessageSquare, label: "Pengaduan" },
  ];
  if (user?.role === "SUPER_ADMIN") {
    menus.push({ href: "/admin/management-users", icon: Users, label: "Manajemen User" });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 flex-col border-r bg-muted/40 p-6 md:flex">
        <div className="flex h-14 items-center border-b">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <div className="my-4 px-2 py-2 bg-muted/60 rounded-md">
          <p className="text-sm font-medium">{user?.name || "Admin"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1 bg-primary/10 text-primary px-2 py-1 rounded inline-block">{user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Pariwisata"}</p>
        </div>
        <nav className="flex-1 pt-4">
          <div className="space-y-1">
            {menus.map((menu) => {
              const active = menu.customActive ? menu.customActive() : isActive(menu.href);
              const Icon = menu.icon;
              return (
                <Button
                  key={menu.href}
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${active ? "font-bold text-primary" : ""}`}
                  onClick={() => router.push(menu.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{menu.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full justify-start text-red-500" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div id="mobile-sidebar" className="md:hidden hidden w-64 absolute z-40 top-16 left-0 bottom-0 bg-background border-r">
        <div className="px-4 py-4">
          <div className="my-4 px-2 py-2 bg-muted/60 rounded-md">
            <p className="text-sm font-medium">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1 bg-primary/10 text-primary px-2 py-1 rounded inline-block">{user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Pariwisata"}</p>
          </div>
          <nav className="space-y-1">
            {menus.map((menu) => {
              const active = menu.customActive ? menu.customActive() : isActive(menu.href);
              const Icon = menu.icon;
              return (
                <Button
                  key={menu.href}
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${active ? "font-bold text-primary" : ""}`}
                  onClick={() => router.push(menu.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{menu.label}</span>
                </Button>
              );
            })}
          </nav>
          <div className="mt-4">
            <Button variant="outline" className="w-full justify-start text-red-500" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 