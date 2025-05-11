"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/layout/AdminHeader";

// Dashboard stats component
function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newUsers} baru bulan ini
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Destinasi</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.destinations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeDestinations} destinasi aktif
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Penjualan Tiket</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {stats.ticketSales.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            +{stats.ticketSalesPercentage}% dibanding bulan lalu
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Recent orders component
function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
        <CardDescription>
          {orders.length} pesanan dibuat bulan ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center">
              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {order.customerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.destination} • {order.ticketType} • {order.quantity}{" "}
                  tiket
                </p>
              </div>
              <div className="ml-auto font-medium">
                Rp {order.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent complaints component
function RecentComplaints({ complaints }: { complaints: any[] }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Komplain Terbaru</CardTitle>
        <CardDescription>
          {complaints.length} komplain perlu ditindaklanjuti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="flex items-center">
              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {complaint.subject}
                </p>
                <p className="text-sm text-muted-foreground">
                  {complaint.destination} • {complaint.customerName} •{" "}
                  {complaint.date}
                </p>
              </div>
              <div className="ml-auto">
                <Button variant="outline" size="sm">
                  Lihat
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    users: 245,
    newUsers: 12,
    destinations: 32,
    activeDestinations: 28,
    ticketSales: 5250000,
    ticketSalesPercentage: 12,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAuth = async () => {
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

        // Simulate loading data
        setTimeout(() => {
          // Dummy stats
          setStats({
            users: 245,
            newUsers: 12,
            destinations: 32,
            activeDestinations: 28,
            ticketSales: 5250000,
            ticketSalesPercentage: 12,
          });

          // Dummy orders
          setOrders([
            {
              id: "1",
              customerName: "Ananda Fattahila",
              destination: "Pantai Petanahan",
              ticketType: "Weekday",
              quantity: 2,
              amount: 50000,
            },
            {
              id: "2",
              customerName: "Budi Santoso",
              destination: "Goa Jatijajar",
              ticketType: "Weekend",
              quantity: 4,
              amount: 120000,
            },
            {
              id: "3",
              customerName: "Citra Dewi",
              destination: "Benteng Van Der Wijck",
              ticketType: "Holiday",
              quantity: 3,
              amount: 90000,
            },
          ]);

          // Dummy complaints
          setComplaints([
            {
              id: "1",
              subject: "Kebersihan Toilet",
              destination: "Pantai Petanahan",
              customerName: "Dian Sastro",
              date: "12 Jun 2023",
            },
            {
              id: "2",
              subject: "Parkir Penuh",
              destination: "Goa Jatijajar",
              customerName: "Eko Prakoso",
              date: "10 Jun 2023",
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-muted/40 p-6 md:flex">
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

      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <AdminHeader user={user} />

        {/* Main content */}
        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Pesanan</TabsTrigger>
              <TabsTrigger value="complaints">Komplain</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <DashboardStats stats={stats} />
              <div className="grid gap-4 md:grid-cols-3">
                <RecentOrders orders={orders} />
              </div>
            </TabsContent>
            <TabsContent value="orders" className="space-y-6">
              <RecentOrders orders={orders} />
            </TabsContent>
            <TabsContent value="complaints" className="space-y-6">
              <RecentComplaints complaints={complaints} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
