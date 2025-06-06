"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Loading from "@/components/loading/loading";
import { CheckCircle2, XCircle, Copy } from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const booking_trx_id = Array.isArray(params?.booking_trx_id) ? params.booking_trx_id[0] : params?.booking_trx_id;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!booking_trx_id) return;
    setLoading(true);
    fetch(`/api/consumer/tickets?booking_trx_id=${booking_trx_id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil detail tiket");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.data)) {
          setTicket(data.data.find((t: any) => t.booking_trx_id === booking_trx_id));
        } else if (data.data && data.data.booking_trx_id === booking_trx_id) {
          setTicket(data.data);
        } else {
          setTicket(null);
        }
      })
      .catch((e) => setError(e?.message ? e.message : String(e) || "Gagal mengambil detail tiket"))
      .finally(() => setLoading(false));
  }, [booking_trx_id]);

  const copyToClipboard = async () => {
    if (ticket?.booking_trx_id) {
      try {
        await navigator.clipboard.writeText(ticket.booking_trx_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        //
      }
    }
  };

  if (loading) return <><Navbar /><Loading message="Memuat detail tiket..." /><Footer /></>;
  if (error || !ticket) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-red-500">{error || "Tiket tidak ditemukan"}</div><Footer /></>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <div className="bg-gradient-to-r from-[#5DB6E2] to-[#4A9BC7] py-8 px-4 md:px-0 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md">Detail Tiket</h1>
      </div>
      <main className="max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-8">
          {/* Kode Tiket */}
          <div className="flex flex-col items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-bold tracking-widest mb-2">Kode Tiket</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-yellow-600 tracking-wider">{ticket.booking_trx_id}</span>
              <button onClick={copyToClipboard} className="ml-2 p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 transition-colors" title="Salin Kode Tiket">
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
            <span className="text-xs text-gray-400">Klik untuk menyalin kode tiket</span>
          </div>

          {/* Status & Info */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              {ticket.is_paid ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Terkonfirmasi</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Belum Konfirmasi</span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Tanggal Kunjungan: <span className="font-semibold text-gray-800">{new Date(ticket.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Destinasi & Harga */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-6">
            <div>
              <div className="text-gray-500 text-sm">Destinasi Wisata</div>
              <div className="font-bold text-lg text-gray-800">{ticket.tourist_destination?.name || '-'}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">Total Harga</div>
              <div className="font-bold text-lg text-[#F9A51A]">Rp. {Number(ticket.total_amount).toLocaleString()}</div>
            </div>
          </div>

          {/* Pengunjung */}
          <div className="border-t pt-6">
            <div className="font-bold text-lg mb-4 text-gray-800">Daftar Pengunjung ({ticket.pengunjung.length})</div>
            <div className="grid grid-cols-1 gap-4">
              {ticket.pengunjung.map((p: any, idx: number) => (
                <div key={p.id} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1 border">
                  <div className="font-semibold text-sm mb-1">Pengunjung {idx + 1}</div>
                  <div className="text-gray-700">Nama: {p.nama}</div>
                  <div className="text-gray-700">Usia: {p.usia} tahun</div>
                  <div className="text-gray-700">Email: {p.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Aksi */}
          <div className="flex flex-col md:flex-row gap-4 border-t pt-6">
            <button
              onClick={() => router.push('/consumer/dashboard?tab=tickets')}
              className="flex-1 bg-[#F9A51A] hover:bg-yellow-400 text-white font-bold py-3 rounded-lg text-lg shadow"
            >
              Kembali ke Daftar Tiket
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg text-lg shadow"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 