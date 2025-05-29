"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { User, MapPin, Mail, Calendar, Phone, Upload, FileText } from "lucide-react";
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

const jenisOptions = [
  { value: "LOST_FOUND", label: "Barang Hilang", icon: <FileText className="w-4 h-4 mr-1" /> },
  { value: "KERUSAKAN", label: "Kerusakan Fasilitas", icon: <FileText className="w-4 h-4 mr-1" /> },
  { value: "KECELAKAAN", label: "Kecelakaan Wisata", icon: <FileText className="w-4 h-4 mr-1" /> },
];

export default function PengaduanForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [form, setForm] = useState({
    nama: "",
    destinationId: "",
    email: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: "",
    narahubung: "",
    deskripsi: "",
    longitude: "",
    latitude: "",
    file: null as File | null,
  });
  const [mapPos, setMapPos] = useState({ lat: -7.6778, lng: 109.6536 });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/consumer/me").then(async r => {
      if (!r.ok) {
        router.replace("/consumer/login");
        return;
      }
      const data = await r.json();
      setUser(data.user);
      setForm(f => ({ ...f, nama: data.user?.name || "", email: data.user?.email || "" }));
      setLoadingUser(false);
    });
    fetch("/api/admin/tourist-destinations").then(async r => {
      if (r.ok) {
        const data = await r.json();
        setDestinations(data);
      }
    });
  }, [router]);

  if (loadingUser) return <div>Loading...</div>;
  if (!user) return null;

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleFile = (e: any) => {
    setForm(f => ({ ...f, file: e.target.files[0] }));
  };
  const handleMapClick = (e: any) => {
    setForm(f => ({ ...f, latitude: e.lngLat.lat, longitude: e.lngLat.lng }));
    setMapPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    // Validasi
    if (!form.destinationId || !form.jenis || !form.narahubung || !form.deskripsi) {
      setAlert({ type: 'error', message: 'Semua field wajib diisi.' });
      setLoading(false);
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v as any);
    });
    const res = await fetch("/api/consumer/pengaduan", {
      method: "POST",
      body: formData
    });
    setLoading(false);
    if (res.ok) {
      setAlert({ type: 'success', message: 'Pengaduan berhasil dikirim!' });
      setTimeout(() => router.push("/consumer/pengaduan"), 1200);
    } else {
      let err = { error: '' };
      try {
        err = await res.json();
      } catch {
        err = { error: 'Gagal mengirim pengaduan (server error)' };
      }
      setAlert({ type: 'error', message: err.error || 'Gagal mengirim pengaduan' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f7f7f7] py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-center mb-2">Layanan Pelaporan</h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="text-xl font-semibold mb-2">Detail Pengaduan</div>
            {alert && (
              <div className={`rounded p-3 text-center mb-2 ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{alert.message}</div>
            )}
            <div>
              <label className="font-semibold flex items-center gap-2"><User className="w-4 h-4" />Nama Pelapor</label>
              <input type="text" name="nama" value={form.nama} disabled className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Tempat Kejadian</label>
              <select
                name="destinationId"
                value={form.destinationId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Pilih Tempat Kejadian</option>
                {destinations.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4" />Email</label>
              <input type="email" name="email" value={form.email} disabled className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />Tanggal Pengaduan</label>
              <input type="date" name="tanggal" value={form.tanggal} disabled className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Jenis Pengaduan</label>
              <div className="flex gap-4 mt-1">
                {jenisOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenis" value={opt.value} checked={form.jenis === opt.value} onChange={handleChange} required />
                    {opt.icon}<span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><Phone className="w-4 h-4" />Narahubung</label>
              <input type="text" name="narahubung" value={form.narahubung} onChange={handleChange} required className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Deskripsikan</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3} className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><Upload className="w-4 h-4" />Foto/Dokumentasi</label>
              <input type="file" accept="image/*" onChange={handleFile} className="w-full" />
            </div>
            <div>
              <label className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Lokasi Details</label>
              <div className="rounded-xl overflow-hidden mb-2" style={{height: 200}}>
                <Map
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                  initialViewState={{ latitude: mapPos.lat, longitude: mapPos.lng, zoom: 11 }}
                  style={{ width: "100%", height: 200 }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  onClick={handleMapClick}
                />
              </div>
              <div className="flex gap-2">
                <input type="text" name="longitude" value={form.longitude} placeholder="Longitude" readOnly className="w-1/2 rounded-lg border px-3 py-2 bg-gray-100" />
                <input type="text" name="latitude" value={form.latitude} placeholder="Latitude" readOnly className="w-1/2 rounded-lg border px-3 py-2 bg-gray-100" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-lg transition">
              {loading ? "Mengirim..." : "Laporkan"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
