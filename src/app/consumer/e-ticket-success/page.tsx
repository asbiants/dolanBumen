"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Loading from "@/components/loading/loading";

export default function ETicketSuccessPage() {
  const [booking, setBooking] = useState<any>(null);
  const [pengunjung, setPengunjung] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/booking/session", { method: "GET" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal ambil data booking");
        return res.json();
      })
      .then((data) => {
        if (data.data.booking && data.data.booking.booking_trx_id) {
          setBooking(data.data.booking);
          setPengunjung(data.data.pengunjung);
        } else {
          // fallback ke localStorage
          const lastBooking = localStorage.getItem("last_booking_data");
          if (lastBooking) {
            const parsed = JSON.parse(lastBooking);
            setBooking(parsed.booking || parsed);
            setPengunjung(parsed.pengunjung || []);
          }
        }
      })
      .catch(() => {
        // fallback ke localStorage jika error
        const lastBooking = localStorage.getItem("last_booking_data");
        if (lastBooking) {
          const parsed = JSON.parse(lastBooking);
          setBooking(parsed.booking || parsed);
          setPengunjung(parsed.pengunjung || []);
        } else {
          setError("Gagal mengambil data booking");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = async () => {
    if (booking?.booking_trx_id) {
      try {
        await navigator.clipboard.writeText(booking.booking_trx_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) return <><Navbar /><Loading message="Memuat halaman sukses..." /><Footer /></>;
  if (error) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-red-500">{error}</div><Footer /></>;
  if (!booking) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <div className="bg-gradient-to-r from-[#5DB6E2] to-[#4A9BC7] py-8 px-4 md:px-0 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md">Pembayaran Berhasil</h1>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6">
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-gray-600">Terima kasih telah melakukan pembayaran. Detail pesanan Anda telah kami kirimkan ke email.</p>
          </div>

          {/* Ticket Code */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-8 text-center relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
              Kode Tiket
            </div>
            <div className="mt-8 mb-2">
              <p className="text-4xl font-bold text-yellow-600 tracking-wider font-mono mb-3">
                {booking?.booking_trx_id || "-"}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">Simpan kode ini sebagai bukti pembayaran Anda</p>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Booking Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Pesanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Informasi Pemesan</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Nama:</span> {booking.nama}</p>
                  <p><span className="text-gray-600">Email:</span> {booking.email}</p>
                  <p><span className="text-gray-600">No. Telepon:</span> {booking.phone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Detail Kunjungan</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Tanggal:</span> {new Date(booking.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><span className="text-gray-600">Jumlah Pengunjung:</span> {booking.quantity} orang</p>
                  <p><span className="text-gray-600">Total Pembayaran:</span> Rp. {Number(booking.total_amount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visitor List */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Daftar Pengunjung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pengunjung.map((p, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-800">Pengunjung {idx + 1}</p>
                  <p className="text-gray-600">{p.nama}</p>
                  <p className="text-sm text-gray-500">Usia: {p.usia} tahun</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => router.push('/consumer/e-ticket-list')}
              className="flex-1 bg-[#F9A51A] hover:bg-yellow-400 text-white font-bold py-3 rounded-lg text-lg shadow"
            >
              Lihat Daftar Tiket
            </button>
            <button 
              onClick={() => router.push('/consumer/beranda')}
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