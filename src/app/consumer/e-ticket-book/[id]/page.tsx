"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Loading from "@/components/loading/loading";
import dynamic from "next/dynamic";
import { Marker } from "react-map-gl";

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

function getDayType(dateStr: string) {
  if (!dateStr) return "weekday";
  const day = new Date(dateStr).getDay();
  return (day === 0 || day === 6) ? "weekend" : "weekday";
}

export default function E_TicketBookPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [user, setUser] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [tanggal, setTanggal] = useState("");
  const [jenisKendaraan, setJenisKendaraan] = useState("MOTOR");
  const [jumlahKendaraan, setJumlahKendaraan] = useState(1);
  const [jumlahPengunjung, setJumlahPengunjung] = useState(1);
  const [pengunjung, setPengunjung] = useState([{ nama: "", usia: "", email: "" }]);
  const [harga, setHarga] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/consumer/me").then(async (res) => res.ok ? res.json() : null),
      typeof id === "string" && id.length > 0
        ? fetch(`/api/admin/tourist-destinations/${id}`).then(async (res) => res.ok ? res.json() : null)
        : Promise.resolve(null),
      typeof id === "string" && id.length > 0
        ? fetch(`/api/admin/tourist-destinations/tickets?destinationId=${id}`).then(async (res) => res.ok ? res.json() : [])
        : Promise.resolve([])
    ]).then(([userData, destData, ticketData]) => {
      if (!userData || !destData) {
        setError("Data tidak ditemukan");
      } else {
        setUser(userData.user);
        setDestination(destData);
        setTickets(ticketData);
        setPengunjung([{ nama: userData.user.name, usia: "", email: userData.user.email }]);
      }
    }).catch(() => setError("Gagal mengambil data"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!tickets.length) return;
    const dayType = getDayType(tanggal);
    // Ambil harga tiket weekday/weekend dari tiket yang sesuai
    let ticket = null;
    if (dayType === "weekday") {
      ticket = tickets.find((t) => t.ticketType === "WEEKDAY");
    } else {
      ticket = tickets.find((t) => t.ticketType === "WEEKEND");
    }
    setHarga(ticket ? Number(ticket.price) : 0);
  }, [tanggal, tickets]);

  useEffect(() => {
    setPengunjung((prev) => {
      const arr = [...prev];
      while (arr.length < jumlahPengunjung) arr.push({ nama: "", usia: "", email: "" });
      while (arr.length > jumlahPengunjung) arr.pop();
      return arr;
    });
  }, [jumlahPengunjung]);

  const handlePengunjungChange = (idx: number, field: string, value: string) => {
    setPengunjung((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || !destination) return;
    // Pastikan harga yang dikirim sesuai tanggal kunjungan
    const dayType = getDayType(tanggal);
    let ticket = null;
    if (dayType === "weekday") {
      ticket = tickets.find((t) => t.ticketType === "WEEKDAY");
    } else {
      ticket = tickets.find((t) => t.ticketType === "WEEKEND");
    }
    const hargaTiket = ticket ? Number(ticket.price) : 0;
    // Konversi field ke format yang benar
    const booking = {
      nama: user.name,
      phone: user.phoneNumber,
      email: user.email,
      kendaraan: jenisKendaraan,
      jumlah_kendaraan: typeof jumlahKendaraan === "string" ? parseInt(jumlahKendaraan, 10) : jumlahKendaraan,
      tanggal: new Date(tanggal).toISOString(),
      destinasi_wisata_id: destination.id,
      user_id: user.id,
      total_amount: hargaTiket * jumlahPengunjung,
      quantity: typeof jumlahPengunjung === "string" ? parseInt(jumlahPengunjung, 10) : jumlahPengunjung,
      harga_satuan: hargaTiket,
      tourist_destination: { id: destination.id, name: destination.name },
    };
    const pengunjungData = (pengunjung || []).map((p: any) => ({
      ...p,
      usia: parseInt(p.usia, 10),
    }));
    const res = await fetch("/api/booking/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking, pengunjung: pengunjungData }),
    });
    if (res.ok) router.push("/consumer/e-ticket-payment");
  };

  if (loading) return <><Navbar /><Loading message="Memuat halaman booking..." /><Footer /></>;
  if (error) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-red-500">{error}</div><Footer /></>;
  if (!user || !destination) return null;

  // Ambil harga weekday/weekend dari tiket
  const weekdayTicket = tickets.find((t) => t.ticketType === "WEEKDAY");
  const weekendTicket = tickets.find((t) => t.ticketType === "WEEKEND");

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <div className="bg-gradient-to-r from-[#5DB6E2] to-[#4A9BC7] py-8 px-4 md:px-0 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md">Pembelian E-Ticket</h1>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-start">
        {/* Kiri: Info Destinasi */}
        <section className="md:col-span-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-6 mb-4">
          <div>
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center mb-2">
              {destination.thumbnailUrl ? (
                <img src={destination.thumbnailUrl} alt={destination.name} className="object-cover w-full h-full rounded-2xl" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="font-bold text-2xl text-gray-800 mb-1">{destination.name}</div>
            <div className="text-gray-600 mb-2 text-lg">{destination.openingTime ? new Date(destination.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {destination.closingTime ? new Date(destination.closingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
            <div className="flex items-center gap-3 mb-2">
              {destination.category?.icon && <img src={destination.category.icon} alt={destination.category.name} className="w-8 h-8 rounded-full shadow-md" />}
              <span className="font-semibold text-gray-700 text-lg">{destination.category?.name || '-'}</span>
            </div>
            {/* Harga Tiket */}
            <div className="mb-2">
              <div className="text-base font-semibold text-gray-700">Harga Tiket</div>
              <div className="flex gap-2 text-sm mt-1">
                <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">Weekday: Rp. {weekdayTicket ? Number(weekdayTicket.price).toLocaleString() : '-'}</span>
                <span className="bg-blue-100 text-blue-700 rounded px-2 py-1">Weekend: Rp. {weekendTicket ? Number(weekendTicket.price).toLocaleString() : '-'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 text-center text-blue-700 font-semibold shadow-inner">Selamat Berkunjung</div>
            <div className="mt-2">
              <div className="font-semibold text-sm mb-2">Detail Lokasi</div>
              <div className="rounded-2xl overflow-hidden mb-2 shadow-lg" style={{height: 180}}>
                {destination.latitude && destination.longitude ? (
                  <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    initialViewState={{
                      latitude: Number(destination.latitude),
                      longitude: Number(destination.longitude),
                      zoom: 13,
                    }}
                    style={{ width: "100%", height: 180 }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                  >
                    <Marker longitude={Number(destination.longitude)} latitude={Number(destination.latitude)} anchor="bottom">
                      {destination.category?.icon ? (
                        <img
                          src={destination.category.icon}
                          alt={destination.category.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-lg bg-white object-cover"
                          style={{ transform: "translateY(-8px)" }}
                        />
                      ) : (
                        <div className="bg-yellow-400 rounded-full p-1 shadow-lg border-2 border-white" />
                      )}
                    </Marker>
                  </Map>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">[Map]</div>
                )}
              </div>
              <div className="text-xs text-gray-500">Alamat Lokasi : {destination.address || '-'}</div>
              <button className="mt-2 w-full bg-yellow-300 rounded-lg py-2 font-semibold text-sm">Lihat Rute Lokasi</button>
            </div>
          </div>
        </section>
        {/* Kanan: Form Booking */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Data Pemesan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <div className="font-bold text-xl mb-4 text-gray-800">Data Pemesan</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                  <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Nama Lengkap" value={user.name || ""} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Nomor Handphone/WA</label>
                  <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Nomor Handphone/WA" value={user.phoneNumber || ""} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Email" value={user.email || ""} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Tanggal Kunjungan</label>
                  <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                </div>
              </div>
            </div>
            {/* Detail Kendaraan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <div className="font-bold text-xl mb-4 text-gray-800">Detail Kendaraan</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Jenis Kendaraan</label>
                  <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" value={jenisKendaraan} onChange={e => setJenisKendaraan(e.target.value)}>
                    <option value="MOTOR">Motor</option>
                    <option value="MOBIL">Mobil</option>
                    <option value="BIG_BUS">Big Bus</option>
                    <option value="MINI_BUS">Mini Bus</option>
                    <option value="SEPEDA">Sepeda</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Jumlah Kendaraan</label>
                  <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" type="number" min={1} value={jumlahKendaraan} onChange={e => setJumlahKendaraan(Number(e.target.value))} placeholder="Jumlah Kendaraan" />
                </div>
              </div>
            </div>
            {/* Harga & Pengunjung */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#F9A51A] font-bold text-2xl">Rp. {harga.toLocaleString()}</span>
                <span className="text-gray-500 text-lg">/Orang</span>
                <div className="ml-auto flex items-center gap-2">
                  <button type="button" className="bg-gray-200 px-3 py-1 rounded text-lg font-bold" onClick={() => setJumlahPengunjung(Math.max(1, jumlahPengunjung - 1))}>-</button>
                  <span className="font-bold text-xl">{jumlahPengunjung}</span>
                  <button type="button" className="bg-gray-200 px-3 py-1 rounded text-lg font-bold" onClick={() => setJumlahPengunjung(jumlahPengunjung + 1)}>+</button>
                </div>
              </div>
            </div>
            {/* Detail Pengunjung */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <div className="font-bold text-xl mb-4 text-gray-800">Detail Pengunjung</div>
              <div className="flex flex-col gap-6 px-0">
                {pengunjung.map((p, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border w-full">
                    <div className="font-semibold text-sm mb-1">Pengunjung {idx + 1}</div>
                    <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                    <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Nama Lengkap" value={p.nama} onChange={e => handlePengunjungChange(idx, "nama", e.target.value)} required />
                    <label className="text-xs font-semibold text-gray-600">Usia Pengunjung</label>
                    <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Usia Pengunjung" value={p.usia} onChange={e => handlePengunjungChange(idx, "usia", e.target.value)} required />
                    <label className="text-xs font-semibold text-gray-600">Email</label>
                    <input className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Email" value={p.email} onChange={e => handlePengunjungChange(idx, "email", e.target.value)} required />
                  </div>
                ))}
              </div>
            </div>
            {/* Detail Pembayaran */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <div className="font-bold text-xl mb-4 text-gray-800">Detail Pembayaran</div>
              <div className="flex justify-between text-base"><span>Jumlah Pengunjung</span><span>{jumlahPengunjung}</span></div>
              <div className="flex justify-between text-base"><span>Harga Satuan</span><span>Rp. {harga.toLocaleString()}</span></div>
              <div className="flex justify-between text-xl font-bold"><span>Total Harga</span><span className="text-[#F9A51A]">Rp. {(harga * jumlahPengunjung).toLocaleString()}</span></div>
              <button type="submit" className="mt-2 bg-[#F9A51A] hover:bg-yellow-400 text-white font-bold py-3 rounded-lg text-lg shadow">Bayar Sekarang</button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
} 