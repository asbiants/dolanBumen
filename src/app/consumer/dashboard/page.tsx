"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Ticket, History, Settings, AlertCircle, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Footer from '@/components/footer/footer';

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

interface Complaint {
  id: string;
  jenis: string;
  deskripsi: string;
  status: string;
  response: string | null;
  responseDate: Date | null;
  createdAt: Date;
  destination: {
    name: string;
  };
  admin: {
    name: string;
  } | null;
  fileUrl?: string;
}

interface BookingTicket {
  id: number;
  booking_trx_id: string;
  is_paid: boolean;
  tanggal: string;
  tourist_destination: { id: string; name: string };
  pengunjung: { id: number; nama: string; usia: number; email: string }[];
}

export default function ConsumerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<BookingTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, complaintsResponse, ticketsResponse] = await Promise.all([
          fetch("/api/auth/consumer/me"),
          fetch("/api/complaints"),
          fetch("/api/consumer/tickets")
        ]);

        if (!userResponse.ok) {
          throw new Error("Gagal mengambil data pengguna");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          const arr = Array.isArray(complaintsData.complaints) ? complaintsData.complaints : (Array.isArray(complaintsData.data) ? complaintsData.data : []);
          setComplaints(arr);
        }

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          setTickets(Array.isArray(ticketsData.data) ? ticketsData.data : []);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/consumer/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Gagal logout");
      }

      router.push("/consumer/beranda");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal logout");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PROCESSING':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu';
      case 'PROCESSING':
        return 'Diproses';
      case 'RESOLVED':
        return 'Selesai';
      case 'REJECTED':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tiket
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Pengguna</CardTitle>
                <CardDescription>Informasi pribadi Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nama</p>
                        <p className="text-lg">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                        <p className="text-lg">{user.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Alamat</p>
                        <p className="text-lg">{user.address}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Tiket Saya</CardTitle>
                <CardDescription>Tiket yang telah Anda beli</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="text-gray-500">Belum ada tiket yang dibeli</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest">{ticket.booking_trx_id}</span>
                          <button
                            onClick={() => router.push(`/consumer/ticket/${ticket.booking_trx_id}`)}
                            className="bg-gray-100 hover:bg-yellow-100 p-2 rounded-full transition-colors"
                            title="Lihat Detail Tiket"
                          >
                            <Eye className="h-5 w-5 text-yellow-600" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="font-bold text-lg text-gray-800 mb-1">{ticket.tourist_destination?.name || '-'}</div>
                          <div className="text-sm text-gray-500 mb-2">{new Date(ticket.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {ticket.is_paid ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Terkonfirmasi</span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Belum Konfirmasi</span>
                            )}
                            <span className="ml-auto text-xs text-gray-400">{ticket.pengunjung.length} Pengunjung</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengaduan</CardTitle>
                <CardDescription>Status dan riwayat pengaduan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : (Array.isArray(complaints) && complaints.length === 0) ? (
                  <p className="text-gray-500">Belum ada riwayat pengaduan</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {(showAllComplaints ? complaints : complaints.slice(0, 2)).map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{complaint.destination.name}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(complaint.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusIcon(complaint.status)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                                {getStatusText(complaint.status)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/consumer/complaints/${complaint.id}`)}
                                className="hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 text-sm">
                            <p className="font-medium">Jenis: {complaint.jenis}</p>
                            <p className="mt-1 text-gray-600 line-clamp-2">{complaint.deskripsi}</p>
                          </div>
                          {complaint.response && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium text-gray-500">Respon dari Admin:</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{complaint.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {Array.isArray(complaints) && complaints.length > 2 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllComplaints((v) => !v)}
                        >
                          {showAllComplaints ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Akun</CardTitle>
                <CardDescription>Kelola pengaturan akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Fitur pengaturan akun akan segera hadir</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
} 