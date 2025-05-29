"use client";

import { useState, useEffect } from "react";
import { BarChart, Users, MapPin, Ticket, ShoppingCart, MessageSquare, User, Mail, Phone, FileText, Upload, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

interface Complaint {
  id: string;
  user: { name: string; email: string };
  destination: { name: string };
  jenis: string;
  narahubung: string;
  deskripsi: string;
  longitude: string;
  latitude: string;
  attachment?: string;
  status: string;
  response?: string;
  createdAt: string;
}

const statusOptions = [
  { value: "NEW", label: "Baru" },
  { value: "IN_PROGRESS", label: "Diproses" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

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
          <p className="text-xs text-muted-foreground">+{stats.newUsers} baru bulan ini</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Destinasi</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.destinations}</div>
          <p className="text-xs text-muted-foreground">{stats.activeDestinations} destinasi aktif</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Penjualan Tiket</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rp {stats.ticketSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+{stats.ticketSalesPercentage}% dibanding bulan lalu</p>
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
        <CardDescription>{orders.length} pesanan dibuat bulan ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center">
              <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.destination} • {order.ticketType} • {order.quantity} tiket
                </p>
              </div>
              <div className="ml-auto font-medium">Rp {order.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/complaints").then(async r => {
      if (r.ok) {
        const data = await r.json();
        setComplaints(data.complaints);
      }
      setLoading(false);
    });
  }, []);

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setStatus(c.status);
    setResponse(c.response || "");
    setAlert(null);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setAlert(null);
    const res = await fetch(`/api/admin/complaints/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, response }),
    });
    setSaving(false);
    if (res.ok) {
      setAlert("Status/respon berhasil diupdate!");
      // Update local state
      setComplaints(cs => cs.map(c => c.id === selected.id ? { ...c, status, response } : c));
    } else {
      setAlert("Gagal update status/respon");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daftar Pengaduan</CardTitle>
        <CardDescription>Semua pengaduan dari user.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {complaints.length === 0 && <div>Tidak ada pengaduan.</div>}
            {complaints.map(c => (
              <div key={c.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold">{c.destination?.name}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-200">{c.status}</span>
                  <Button size="sm" variant="outline" onClick={() => openDetail(c)}>Detail</Button>
                </div>
                <div className="text-sm text-gray-600">{c.jenis} - {c.narahubung}</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        {/* Modal/detail */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setSelected(null)}>&times;</button>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Detail Pengaduan</h2>
              {alert && <div className="mb-2 text-center text-sm text-green-700 bg-green-100 rounded p-2">{alert}</div>}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {selected.user?.name} ({selected.user?.email})</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selected.destination?.name}</div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Jenis: {selected.jenis}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Narahubung: {selected.narahubung}</div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Deskripsi: {selected.deskripsi}</div>
                <div className="flex items-center gap-2"><Upload className="w-4 h-4" /> Foto: {selected.attachment ? <a href={selected.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> : <span className="text-gray-400">-</span>}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Lokasi: {selected.longitude}, {selected.latitude}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Tanggal: {new Date(selected.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Status:
                  <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 border rounded px-2 py-1">
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Respon Admin</label>
                  <textarea value={response} onChange={e => setResponse(e.target.value)} rows={2} className="w-full border rounded px-2 py-1" placeholder="Tulis respon admin..." />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 text-white">{saving ? "Menyimpan..." : "Update Status/Respon"}</Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard Admin</h1>
      <Tabs defaultValue="complaints" className="space-y-6 w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="complaints">Pengaduan</TabsTrigger>
        </TabsList>
        <TabsContent value="complaints" className="space-y-6 w-full">
          <ComplaintList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
