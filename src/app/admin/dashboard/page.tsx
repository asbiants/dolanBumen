"use client";

import { useState } from "react";
import {
  BarChart,
  Users,
  MapPin,
  Ticket,
  ShoppingCart,
  MessageSquare,
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

// Dashboard stats component
function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
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
    <Card className="w-full">
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
    <Card className="w-full">
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 245,
    newUsers: 12,
    destinations: 32,
    activeDestinations: 28,
    ticketSales: 5250000,
    ticketSalesPercentage: 12,
  });

  const [orders, setOrders] = useState([
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

  const [complaints, setComplaints] = useState([
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

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-6 w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
          <TabsTrigger value="complaints">Komplain</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 w-full">
          <DashboardStats stats={stats} />
          <div className="grid gap-4 grid-cols-1 w-full">
            <RecentOrders orders={orders} />
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-6 w-full">
          <RecentOrders orders={orders} />
        </TabsContent>
        <TabsContent value="complaints" className="space-y-6 w-full">
          <RecentComplaints complaints={complaints} />
        </TabsContent>
      </Tabs>
    </>
  );
}
