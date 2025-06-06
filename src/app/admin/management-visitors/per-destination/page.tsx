"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import Loading from "@/components/loading/loading";

export default function PerDestinationVisitorsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [range, setRange] = useState<'day' | 'week' | 'month'>('day');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all destinations for dropdown
  useEffect(() => {
    fetch("/api/admin/tourist-destinations")
      .then(async (res) => res.ok ? res.json() : { data: [] })
      .then((res) => setDestinations(res.data || []));
  }, []);

  // Fetch visitor data for selected range
  useEffect(() => {
    if (!selectedDestination) return;
    setLoading(true);
    fetch(`/api/admin/management-visitors?mode=visitors&range=${range}`)
      .then(async (res) => res.ok ? res.json() : { data: [] })
      .then((res) => {
        // Filter only for selected destination
        setData((res.data || []).filter((d: any) => d.destinasi_wisata_id === selectedDestination));
      })
      .catch(() => setError("Gagal mengambil data pengunjung"))
      .finally(() => setLoading(false));
  }, [selectedDestination, range]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0e7ef] via-[#f6f6f6] to-[#e0e7ef]">
      <div className="pt-6 pb-2 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-lg px-8 py-5 mb-6 border border-gray-100 flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-sm">Monitoring Pengunjung per Destinasi</h1>
          </div>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-2 md:px-4 pb-10 w-full">
        <div className="bg-white/95 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col gap-8 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <label className="font-semibold text-gray-700">Pilih Destinasi:</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={selectedDestination}
              onChange={e => setSelectedDestination(e.target.value)}
            >
              <option value="">-- Pilih Destinasi --</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <label className="font-semibold text-gray-700">Kategori:</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={range}
              onChange={e => setRange(e.target.value as any)}
            >
              <option value="day">Per Hari</option>
              <option value="week">Per Minggu</option>
              <option value="month">Per Bulan</option>
            </select>
          </div>
          {loading ? (
            <Loading message="Memuat data pengunjung..." />
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : !selectedDestination ? (
            <div className="text-gray-500 text-center">Silakan pilih destinasi wisata.</div>
          ) : data.length === 0 ? (
            <div className="text-gray-500 text-center">Belum ada data pengunjung untuk destinasi ini.</div>
          ) : (
            <>
              {/* Grafik */}
              <div className="w-full h-96 bg-white rounded-xl shadow border border-gray-100 p-4 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" interval={0} height={60}
                      tickFormatter={d => new Date(d).toLocaleDateString('id-ID')} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value} pengunjung`} labelFormatter={d => `Tanggal: ${new Date(d).toLocaleDateString('id-ID')}`} />
                    <Bar dataKey="total" fill="#F9A51A" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="total" position="top" fontSize={14} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Tabel */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Pengunjung</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700">{new Date(row.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2 text-yellow-700 font-bold text-lg">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 