"use client";
import { useEffect, useState } from "react";
import { Eye, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import Loading from "@/components/loading/loading";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

interface BookingTicket {
  id: number;
  booking_trx_id: string;
  is_paid: boolean;
  tanggal: string;
  user: { id: string; name: string; email: string };
  tourist_destination: { id: string; name: string };
  pengunjung: { id: number; nama: string; usia: number; email: string }[];
  proof?: string;
}

export default function AdminManagementTicketPage() {
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<BookingTicket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [destinations, setDestinations] = useState<any[]>([]);
  const [filterDestination, setFilterDestination] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showProof, setShowProof] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all destinations for filter dropdown
    fetch("/api/admin/tourist-destinations")
      .then(async (res) => res.ok ? res.json() : { data: [] })
      .then((res) => setDestinations(res.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/admin/management-ticket";
    const params = [];
    if (searchCode) params.push(`kode=${encodeURIComponent(searchCode)}`);
    if (filterDestination) params.push(`destinasi=${filterDestination}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url).then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data tiket");
        return res.json();
}).then((data) => {
        setTickets(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => setError("Gagal mengambil data tiket"))
      .finally(() => setLoading(false));
  }, [searchCode, filterDestination]);

  const handleStatusChange = async (ticketId: number, newStatus: boolean) => {
    const prevTickets = [...tickets];
    setTickets((tks) => tks.map(t => t.id === ticketId ? { ...t, is_paid: newStatus } : t));
    try {
      const res = await fetch("/api/admin/management-ticket", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, is_paid: newStatus })
      });
      if (!res.ok) throw new Error("Gagal update status");
      toast.success("Status tiket berhasil diupdate");
    } catch (e) {
      setTickets(prevTickets); // rollback
      toast.error("Gagal update status tiket");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0e7ef] via-[#f6f6f6] to-[#e0e7ef]">
      <Toaster position="top-right" />
      <div className="pt-6 pb-2 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-lg px-8 py-5 mb-6 border border-gray-100 flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-sm">Manajemen Tiket Pengguna</h1>
          </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-2 md:px-4 pb-10 w-full">
        <div className="bg-white/95 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col gap-8 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Daftar Semua Tiket</h2>
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-4 w-full shadow-sm">
            <div className="flex flex-col gap-2 w-full md:w-72">
              <label className="font-semibold text-gray-700" htmlFor="search-ticket">Cari Kode Tiket:</label>
              <input id="search-ticket" type="text" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" placeholder="Masukkan kode tiket" value={searchCode} onChange={e => setSearchCode(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-72">
              <label className="font-semibold text-gray-700" htmlFor="filter-destination">Filter Destinasi:</label>
              <select id="filter-destination" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" value={filterDestination} onChange={e => setFilterDestination(e.target.value)}>
                <option value="">Semua Destinasi</option>
                {destinations.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full md:w-auto md:self-end">
              <button
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold w-full md:w-auto h-[42px] transition-colors duration-150"
                style={{ minWidth: 90 }}
                onClick={() => { setSearchCode(""); setFilterDestination(""); }}
              >
                Reset
              </button>
            </div>
          </div>
          {loading ? (
            <Loading message="Memuat data tiket..." />
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="text-gray-500 text-center">Belum ada tiket yang dipesan</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kode Tiket</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Pemesan</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destinasi</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pengunjung</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-yellow-50 transition-colors">
                        <td className="px-4 py-2 font-mono font-bold text-yellow-700">{ticket.booking_trx_id}</td>
                        <td className="px-4 py-2">{ticket.user?.name || '-'}</td>
                        <td className="px-4 py-2">{ticket.user?.email || '-'}</td>
                        <td className="px-4 py-2">{ticket.tourist_destination?.name || '-'}</td>
                        <td className="px-4 py-2">{new Date(ticket.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2">
                          <div className="relative inline-block text-left">
                            <button
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${ticket.is_paid ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'}`}
                              onClick={() => handleStatusChange(ticket.id, !ticket.is_paid)}
                              title="Klik untuk ubah status konfirmasi"
                            >
                              {ticket.is_paid ? <><CheckCircle2 className="w-4 h-4" /> Terkonfirmasi</> : <><XCircle className="w-4 h-4" /> Belum Konfirmasi</>}
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">{ticket.pengunjung.length}</td>
                        <td className="px-4 py-2 text-center">
                          {ticket.proof ? (
                            <button onClick={() => { setProofUrl(ticket.proof ?? null); setShowProof(true); }} className="p-2 rounded-full hover:bg-gray-100" title="Lihat Proof">
                              <Eye className="h-5 w-5 text-blue-600" />
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => { setSelectedTicket(ticket); setShowModal(true); }}
                            className="bg-gray-100 hover:bg-yellow-100 p-2 rounded-full transition-colors"
                            title="Lihat Detail Tiket"
                          >
                            <Eye className="h-5 w-5 text-yellow-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {tickets.length > itemsPerPage && (
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, tickets.length)} of {tickets.length}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 rounded border text-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    {Array.from({ length: Math.ceil(tickets.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i}
                        className={`px-3 py-1 rounded border text-sm ${currentPage === i + 1 ? 'bg-yellow-400 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button className="px-3 py-1 rounded border text-sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(tickets.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(tickets.length / itemsPerPage)}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Modal Detail Tiket */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] flex flex-col">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowModal(false)}
                aria-label="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="overflow-y-auto flex-1 pr-2">
                <h3 className="text-lg font-bold mb-4">Detail Tiket</h3>
                <div className="mb-2">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest">{selectedTicket.booking_trx_id}</span>
                </div>
                <div className="mb-2 text-gray-700">Nama Pemesan: <span className="font-semibold">{selectedTicket.user?.name}</span></div>
                <div className="mb-2 text-gray-700">Email: <span className="font-semibold">{selectedTicket.user?.email}</span></div>
                <div className="mb-2 text-gray-700">Destinasi: <span className="font-semibold">{selectedTicket.tourist_destination?.name}</span></div>
                <div className="mb-2 text-gray-700">Tanggal: <span className="font-semibold">{new Date(selectedTicket.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div className="mb-2 text-gray-700">Status: {selectedTicket.is_paid ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Terkonfirmasi</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Belum Konfirmasi</span>
                )}</div>
                <div className="mb-2 text-gray-700">Jumlah Pengunjung: <span className="font-semibold">{selectedTicket.pengunjung.length}</span></div>
                <div className="mt-4">
                  <div className="font-bold mb-2">Daftar Pengunjung</div>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTicket.pengunjung.map((p, idx) => (
                      <div key={p.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="font-semibold text-sm mb-1">Pengunjung {idx + 1}</div>
                        <div>Nama: {p.nama}</div>
                        <div>Usia: {p.usia} tahun</div>
                        <div>Email: {p.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg text-base"
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
        {/* Modal Proof */}
        {showProof && proofUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] flex flex-col">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowProof(false)}
                aria-label="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="overflow-y-auto flex-1 pr-2 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold mb-4">Proof Pembayaran</h3>
                <img src={proofUrl} alt="Proof" className="max-w-full max-h-[60vh] rounded shadow" />
              </div>
              <button
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg text-base"
                onClick={() => setShowProof(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
