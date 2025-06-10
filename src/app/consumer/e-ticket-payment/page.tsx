"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Loading from "@/components/loading/loading";

/* Identifikasi Nomor Rekening yang dituju pada sistem pembaran
Nomor Rekening Dummy */
const BANKS = [
  {
    name: "BCA Pengelola Objek Wisata",
    logo: "/bank/bca.png",
    number: "1935 0009 1200",
  },
  {
    name: "BNI Pengelola Objek Wisata",
    logo: "/bank/bni.png",
    number: "1200 1935 0009",
  },
  {
    name: "BRI Pengelola Objek Wisata",
    logo: "/bank/bri.png",
    number: "0009 1200 1935",
  },
];

export default function ETicketPaymentPage() {
  const [booking, setBooking] = useState<any>(null);
  const [pengunjung, setPengunjung] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    /* Fetch data dari API Session untuk menyimpan data booking
    sebelum di kirim ke database harus melalui proses pengisian detail payment
    API/
    */
    fetch("/api/booking/session", { method: "GET" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal ambil data booking");
        return res.json();
      })
      .then((data) => {
        setBooking(data.data.booking);
        setPengunjung(data.data.pengunjung);
      })
      .catch(() => setError("Gagal mengambil data booking"))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateKodeTiket = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TRX-${dateStr}-${rand}`;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!booking || !bankName || !bankAccount || !bankNumber || !proofFile) {
      setError("Semua field wajib diisi dan upload bukti pembayaran!");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Generate kode tiket
      const kodeTiket = generateKodeTiket();

      // Prepare booking data
      const bookingData = {
        ...booking,
        tanggal: new Date(booking.tanggal).toISOString(),
        jumlah_kendaraan: parseInt(booking.jumlah_kendaraan, 10),
        quantity: parseInt(booking.quantity, 10),
        harga_satuan: booking.harga_satuan ? parseInt(booking.harga_satuan, 10) : booking.total_amount && booking.quantity ? Math.floor(booking.total_amount / booking.quantity) : 0,
        total_amount: parseInt(booking.total_amount, 10),
        customer_bank_name: bankName,
        customer_bank_account: bankAccount,
        customer_bank_number: bankNumber,
        proof: proofUrl, // Using proof consistently
        is_paid: false,
        booking_trx_id: kodeTiket,
      };

      // Prepare visitor data
      const pengunjungData = (pengunjung || []).map((p: any) => ({
        nama: p.nama,
        usia: parseInt(p.usia, 10),
        email: p.email,
      }));

      // Kirim ke API
      const res = await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: bookingData,
          pengunjung: pengunjungData,
        }),
      });

      if (!res.ok) throw new Error("Gagal konfirmasi pembayaran");
      const result = await res.json();
      if (result?.data) {
        localStorage.setItem("last_booking_data", JSON.stringify(result.data));
      }
      // Redirect to success page
      router.push("/consumer/e-ticket-success");
    } catch (err: any) {
      setError(err.message || "Gagal konfirmasi pembayaran");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (number: string, idx: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <Loading message="Memuat halaman pembayaran..." />
        <Footer />
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
        <Footer />
      </>
    );
  if (!booking) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <div className="bg-gradient-to-r from-[#5DB6E2] to-[#4A9BC7] py-8 px-4 md:px-0 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md">Pembayaran E-Ticket</h1>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Kiri: Detail Booking + Transfer Bank */}
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-6">
              <div className="font-bold text-xl mb-2 text-gray-800">Detail Pembayaran</div>
              <div className="flex justify-between text-base">
                <span>Jumlah Pengunjung</span>
                <span>{booking.quantity}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Harga Satuan</span>
                <span>Rp. {Number(booking.harga_satuan).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total Harga</span>
                <span className="text-[#F9A51A]">Rp. {Number(booking.total_amount).toLocaleString()}</span>
              </div>
            </section>
            {/* Card Rekening Bank */}
            <section>
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 md:p-6 max-w-full">
                <div className="text-center font-bold text-lg md:text-xl text-[#1A2341] mb-4">Transfer Bank</div>
                <div className="divide-y">
                  {BANKS.map((bank, idx) => (
                    <div key={bank.name} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <img src={bank.logo} alt={bank.name} className="w-12 h-12 object-contain" />
                      <div className="flex-1">
                        <div className="text-gray-500 text-sm font-semibold">{bank.name}</div>
                        <div className="font-bold text-lg tracking-wider text-[#1A2341]">{bank.number}</div>
                      </div>
                      <button className="text-[#F9A51A] font-bold hover:underline focus:outline-none px-2" onClick={() => handleCopy(bank.number, idx)}>
                        {copiedIdx === idx ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          {/* Kanan: Form Pembayaran */}
          <section className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="font-bold text-xl mb-2 text-gray-800">Isikan Data Bank Anda</div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Nama Bank</label>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Nama Bank..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Nama Akun Bank</label>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Nama Akun..."
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Nomor Rekening</label>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Nomor Rekening..."
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Upload Bukti Pembayaran</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="border border-gray-300 rounded-lg px-4 py-2 bg-white" required />
                {proofFile && <span className="text-xs text-gray-500">{proofFile.name}</span>}
              </div>
              <button type="submit" disabled={submitting} className="mt-2 bg-[#F9A51A] hover:bg-yellow-400 text-white font-bold py-3 rounded-lg text-lg shadow disabled:opacity-60">
                {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
