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
}

export default function AdminSidebar({ user, onLogout, router }: AdminSidebarProps) {
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
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/dashboard")}> <BarChart className="mr-2 h-4 w-4" /><span>Dashboard</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/destinations-category")}> <MapPin className="mr-2 h-4 w-4" /><span>Kategori Wisata</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/destinations")}> <MapPin className="mr-2 h-4 w-4" /><span>Destinasi Wisata</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/tickets")}> <Ticket className="mr-2 h-4 w-4" /><span>Transaksi E-Ticket</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/orders")}> <ShoppingCart className="mr-2 h-4 w-4" /><span>Daftar Pengunjung</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/complaints")}> <MessageSquare className="mr-2 h-4 w-4" /><span>Pelaporan</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/users")}> <Users className="mr-2 h-4 w-4" /><span>Manajemen User</span></Button>
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
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/dashboard")}> <BarChart className="mr-2 h-4 w-4" /><span>Dashboard</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/destinations-category")}> <MapPin className="mr-2 h-4 w-4" /><span>Kategori Wisata</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/destinations")}> <MapPin className="mr-2 h-4 w-4" /><span>Destinasi Wisata</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/tickets")}> <Ticket className="mr-2 h-4 w-4" /><span>Transaksi E-Ticket</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/orders")}> <ShoppingCart className="mr-2 h-4 w-4" /><span>Daftar Pengunjung</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/complaints")}> <MessageSquare className="mr-2 h-4 w-4" /><span>Pelaporan</span></Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/users")}> <Users className="mr-2 h-4 w-4" /><span>Manajemen User</span></Button>
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