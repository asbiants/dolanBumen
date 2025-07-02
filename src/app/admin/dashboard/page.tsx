"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart, Users, MapPin, Ticket, ShoppingCart, MessageSquare, User, Mail, Phone, FileText, Upload, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { Marker } from "react-map-gl";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, BarElement, LinearScale } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, BarElement, LinearScale, ChartDataLabels);

interface Complaint {
  id: string;
  user: { name: string; email: string };
  destination: { id: string; name: string };
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

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface TouristDestination {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: Category;
  thumbnailUrl?: string;
}


function ComplaintList({
  filters,
  destinations,
  complaints: filteredComplaints,
  onComplaintUpdated
}: {
  filters: any;
  destinations: any[];
  complaints: Complaint[];
  onComplaintUpdated: (updatedComplaint: Complaint) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

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
      const updated = { ...selected, status, response };
      onComplaintUpdated(updated);
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
        <div className="space-y-4">
          {filteredComplaints.length === 0 && <div>Tidak ada pengaduan.</div>}
          {filteredComplaints.map(c => (
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
        {selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setSelected(null)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Detail Pengaduan</h2>
              {alert && <div className="mb-4 text-center text-sm text-green-700 bg-green-100 rounded p-2">{alert}</div>}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /> <strong>Pelapor:</strong> {selected.user?.name} ({selected.user?.email})</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> <strong>Tempat:</strong> {selected.destination?.name}</div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> <strong>Jenis:</strong> {selected.jenis}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /> <strong>Narahubung:</strong> {selected.narahubung}</div>
                <div>
                  <strong className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-gray-500" /> Deskripsi:</strong>
                  <p className="text-gray-700 whitespace-pre-wrap border p-3 rounded bg-gray-50">{selected.deskripsi}</p>
                </div>
                {selected.attachment && (
                  <div>
                    <strong className="flex items-center gap-2 mb-1"><Upload className="w-4 h-4 text-gray-500" /> Foto:</strong>
                    <a href={selected.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mt-1">Lihat Lampiran</a>
                  </div>
                )}
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> <strong>Lokasi:</strong> {selected.longitude}, {selected.latitude}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /> <strong>Tanggal:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> <strong>Status:</strong>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2 border rounded px-2 py-1 text-gray-700">
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-gray-500" />Respon Admin</label>
                  <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 text-gray-700" placeholder="Tulis respon admin..." />
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">{saving ? "Menyimpan..." : "Update Status/Respon"}</Button>
                  <Button variant="outline" onClick={() => setSelected(null)} className="px-6 py-2 rounded-md">Tutup</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplaintStats({ complaints }: { complaints: Complaint[] }) {
  // Hitung jumlah pengaduan berdasarkan jenis
  const stats = complaints.reduce((acc, complaint) => {
    acc[complaint.jenis] = (acc[complaint.jenis] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalComplaints = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const data = {
    labels: Object.keys(stats).map(jenis => {
      switch (jenis) {
        case 'LOST_FOUND': return 'Barang Hilang';
        case 'KERUSAKAN': return 'Kerusakan';
        case 'KECELAKAAN': return 'Kecelakaan';
        default: return jenis;
      }
    }),
    datasets: [
      {
        data: Object.values(stats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
        datalabels: {
          color: '#fff', // Warna teks label
          formatter: (value: any, context: any) => {
            const percentage = totalComplaints > 0 ? ((value / totalComplaints) * 100).toFixed(1) + '%' : '0%';
            return percentage;
          },
          // anchor: 'end', // Posisi label
          // align: 'start', // Penjajaran label
          offset: 10, // Jarak dari tepi slice
        }
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to not maintain aspect ratio
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Jumlah Pengaduan berdasarkan Jenis',
      },
      datalabels: {
        // Konfigurasi global untuk datalabels jika diperlukan
      }
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Statistik Pengaduan</CardTitle>
        <CardDescription>Distribusi pengaduan berdasarkan jenis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          {totalComplaints > 0 ? (
            <Pie data={data} options={options} />
          ) : (
            <div className="text-center text-gray-500">Tidak ada data pengaduan untuk ditampilkan.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("destinations");
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [loadingDest, setLoadingDest] = useState(true);
  const [filters, setFilters] = useState({ jenis: "", status: "", destination: "" });
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      setLoadingDest(true);
      try {
        // Fetch destinations
        const destRes = await fetch("/api/admin/tourist-destinations");
        let destinationsData: TouristDestination[] = [];
        if (destRes.ok) {
          const data = await destRes.json();
          const arr = Array.isArray(data.data) ? data.data : [];
          // Ensure latitude and longitude are numbers
          destinationsData = arr.map((d: any) => {
            let lat = d.latitude;
            let lng = d.longitude;
            if (lat && typeof lat === 'object' && typeof lat.toNumber === 'function') lat = lat.toNumber();
            else if (typeof lat === 'string') lat = parseFloat(lat);
            if (lng && typeof lng === 'object' && typeof lng.toNumber === 'function') lng = lng.toNumber();
            else if (typeof lng === 'string') lng = parseFloat(lng);
            return { ...d, latitude: lat, longitude: lng };
          });
          setDestinations(destinationsData);
        }

        // Fetch complaints
        const complaintsRes = await fetch("/api/complaints");
        let complaintsData: Complaint[] = [];
        if (complaintsRes.ok) {
          const data = await complaintsRes.json();
          const arr = Array.isArray(data.complaints) ? data.complaints : (Array.isArray(data.data) ? data.data : []);
          console.log('Initial API Response:', {
            totalComplaints: arr.length,
            sampleComplaint: arr[0],
            allDestinations: arr.map((c: any) => ({
              id: c.id,
              destination: c.destination
            }))
          });
          complaintsData = arr;
          setAllComplaints(complaintsData);
        }

      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoadingDest(false);
      }
    }

    fetchInitialData();
  }, []);

  const filteredComplaints = allComplaints.filter(c => {
    if (filters.jenis && c.jenis !== filters.jenis) {
      return false;
    }

    if (filters.status && c.status !== filters.status) {
      return false;
    }

    if (filters.destination) {
      const destinationMatch = c.destination?.id === filters.destination;
      if (!destinationMatch) {
        console.log('Filtered out by destination:', c.destination?.id, filters.destination);
        return false;
      }
    }

    return true;
  });

  const handleComplaintUpdate = (updatedComplaint: Complaint) => {
    setAllComplaints(prevComplaints =>
      prevComplaints.map(c => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
  };

  // Calculate complaint statistics
  const complaintStats = {
    total: allComplaints.length,
    new: allComplaints.filter(c => c.status === "NEW").length,
    inProgress: allComplaints.filter(c => c.status === "IN_PROGRESS").length,
    resolved: allComplaints.filter(c => c.status === "RESOLVED").length,
    rejected: allComplaints.filter(c => c.status === "REJECTED").length,
  };

  // Calculate complaint types
  const complaintTypes = {
    lostFound: allComplaints.filter(c => c.jenis === "LOST_FOUND").length,
    kerusakan: allComplaints.filter(c => c.jenis === "KERUSAKAN").length,
    kecelakaan: allComplaints.filter(c => c.jenis === "KECELAKAAN").length,
  };

  // Pie chart data for status
  const statusPieData = {
    labels: ['Baru', 'Diproses', 'Selesai', 'Ditolak'],
    datasets: [
      {
        data: [complaintStats.new, complaintStats.inProgress, complaintStats.resolved, complaintStats.rejected],
        backgroundColor: [
          'rgba(59,130,246,0.8)', // blue
          'rgba(251,191,36,0.8)', // yellow
          'rgba(34,197,94,0.8)',  // green
          'rgba(239,68,68,0.8)',  // red
        ],
        borderColor: [
          'rgba(59,130,246,1)',
          'rgba(251,191,36,1)',
          'rgba(34,197,94,1)',
          'rgba(239,68,68,1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for complaint types
  const typeBarData = {
    labels: ['Barang Hilang', 'Kerusakan', 'Kecelakaan'],
    datasets: [
      {
        label: 'Jumlah Pengaduan',
        data: [complaintTypes.lostFound, complaintTypes.kerusakan, complaintTypes.kecelakaan],
        backgroundColor: [
          'rgba(59,130,246,0.8)',
          'rgba(251,191,36,0.8)',
          'rgba(239,68,68,0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard Admin</h1>
      
      {/* Redesigned Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200 shadow-lg hover:shadow-xl transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Destinasi Wisata</CardTitle>
            <MapPin className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{destinations.length}</div>
            <p className="text-xs text-blue-600">Tempat wisata terdaftar</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200 shadow-lg hover:shadow-xl transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Total Pengaduan</CardTitle>
            <MessageSquare className="h-8 w-8 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{complaintStats.total}</div>
            <p className="text-xs text-yellow-600">Pengaduan dari pengunjung</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200 shadow-lg hover:shadow-xl transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Pengaduan Baru</CardTitle>
            <FileText className="h-8 w-8 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{complaintStats.new}</div>
            <p className="text-xs text-red-600">Pengaduan yang belum diproses</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 shadow-lg hover:shadow-xl transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Pengaduan Selesai</CardTitle>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{complaintStats.resolved}</div>
            <p className="text-xs text-green-600">Pengaduan yang telah diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribusi Status Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div style={{ width: 300, height: 300 }}>
                <Pie data={statusPieData} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pengaduan per Jenis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <div style={{ width: "100%", height: 300 }}>
                <Bar data={typeBarData} options={{responsive:true, maintainAspectRatio: false, plugins:{legend:{display:false}}}} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
