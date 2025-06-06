"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Legend } from "recharts";
import Loading from "@/components/loading/loading";
import { PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";

interface VisitorStat {
  id: string;
  name: string;
  total_pengunjung: number;
}

const VEHICLE_COLORS = ["#F9A51A", "#4A9BC7", "#5DB6E2", "#F9C846", "#A3A3A3"];
const VEHICLE_LABELS: Record<string, string> = {
  MOTOR: "Motor",
  MOBIL: "Mobil",
  BIG_BUS: "Big Bus",
  MINI_BUS: "Mini Bus",
  SEPEDA: "Sepeda"
};

export default function AdminManagementVisitorsPage() {
  const [data, setData] = useState<VisitorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'visitors' | 'vehicles' | 'income'>('visitors');
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [incomeData, setIncomeData] = useState<{ perDay: any[]; perDestination: any[] }>({ perDay: [], perDestination: [] });
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeError, setIncomeError] = useState<string | null>(null);
  const [incomeRange, setIncomeRange] = useState<'day' | 'week' | 'month'>('day');
  const [visitorRange, setVisitorRange] = useState<'day' | 'week' | 'month'>('day');
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/management-visitors")
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pengunjung");
        return res.json();
      })
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Gagal mengambil data pengunjung"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch vehicle data when selectedDestination changes
  useEffect(() => {
    if (!selectedDestination) return;
    setVehicleLoading(true);
    fetch(`/api/admin/management-visitors?mode=vehicles&destinationId=${selectedDestination}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data kendaraan");
        return res.json();
      })
      .then((res) => setVehicleData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicleError("Gagal mengambil data kendaraan"))
      .finally(() => setVehicleLoading(false));
  }, [selectedDestination]);

  // Fetch income data
  useEffect(() => {
    if (tab !== 'income') return;
    setIncomeLoading(true);
    fetch(`/api/admin/management-visitors?mode=income&range=${incomeRange}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pendapatan");
        return res.json();
      })
      .then((res) => setIncomeData(res.data || { perDay: [], perDestination: [] }))
      .catch(() => setIncomeError("Gagal mengambil data pendapatan"))
      .finally(() => setIncomeLoading(false));
  }, [tab, incomeRange]);

  // Fetch visitor data with range
  useEffect(() => {
    if (tab !== 'visitors') return;
    setVisitorLoading(true);
    let url = "/api/admin/management-visitors";
    const params = [];
    if (filterDate) params.push(`tanggal=${filterDate}`);
    if (searchCode) params.push(`kode=${encodeURIComponent(searchCode)}`);
    if (params.length) url += `?${params.join("&")}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pengunjung");
        return res.json();
      })
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Gagal mengambil data pengunjung"))
      .finally(() => setLoading(false));
  }, [tab, filterDate, searchCode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0e7ef] via-[#f6f6f6] to-[#e0e7ef]">
      <div className="pt-6 pb-2 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 rounded-2xl shadow-lg px-8 py-5 mb-6 border border-gray-100 flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-sm">Manajemen Pengunjung Wisata</h1>
          </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-2 md:px-4 pb-10 w-full">
        <div className="bg-white/95 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col gap-8 border border-gray-100 mb-8">
          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border transition-colors ${tab === 'visitors' ? 'bg-[#F9A51A] text-white border-yellow-400' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-yellow-50'}`}
              onClick={() => setTab('visitors')}
            >
              Data Pengunjung
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border transition-colors ${tab === 'vehicles' ? 'bg-[#4A9BC7] text-white border-blue-400' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
              onClick={() => setTab('vehicles')}
            >
              Data Kendaraan
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border transition-colors ${tab === 'income' ? 'bg-[#22c55e] text-white border-green-400' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50'}`}
              onClick={() => setTab('income')}
            >
              Jumlah Pendapatan
            </button>
          </div>
          {tab === 'visitors' ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Daftar Nama Pengunjung per Destinasi</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-gray-700">Filter Tanggal:</label>
                  <input type="date" className="border border-gray-300 rounded-lg px-3 py-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-gray-700">Cari Kode Tiket:</label>
                  <input type="text" className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Masukkan kode tiket" value={searchCode} onChange={e => setSearchCode(e.target.value)} />
                </div>
                {(filterDate || searchCode) && (
                  <button className="ml-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold" onClick={() => { setFilterDate(""); setSearchCode(""); }}>Reset</button>
                )}
              </div>
              {loading ? (
                <Loading message="Memuat data pengunjung..." />
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : data.length === 0 || data.every((d: any) => !d.pengunjung || d.pengunjung.length === 0) ? (
                <div className="text-gray-500 text-center">None</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destinasi Wisata</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Pengunjung</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usia</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Kunjungan</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kode Tiket</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((dest: any) => (
                        (dest.pengunjung || []).map((p: any, idx: number) => (
                          <tr key={dest.id + '-' + idx}>
                            <td className="px-4 py-2 font-semibold text-gray-800">{dest.name}</td>
                            <td className="px-4 py-2 text-gray-700">{p.nama}</td>
                            <td className="px-4 py-2 text-gray-700">{p.usia}</td>
                            <td className="px-4 py-2 text-gray-700">{p.email}</td>
                            <td className="px-4 py-2 text-gray-700">{p.booking_transaction ? new Date(p.booking_transaction.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="px-4 py-2 text-gray-700">{p.booking_transaction ? p.booking_transaction.booking_trx_id : '-'}</td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : tab === 'vehicles' ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Jumlah Kendaraan per Jenis</h2>
              {/* Filter destinasi */}
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <label className="font-semibold text-gray-700">Pilih Destinasi Wisata:</label>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  value={selectedDestination}
                  onChange={e => setSelectedDestination(e.target.value)}
                >
                  <option value="">-- Pilih Destinasi --</option>
                  {data.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {vehicleLoading ? (
                <Loading message="Memuat data kendaraan..." />
              ) : vehicleError ? (
                <div className="text-red-500 text-center">{vehicleError}</div>
              ) : !selectedDestination ? (
                <div className="text-gray-500 text-center">Silakan pilih destinasi wisata untuk melihat data kendaraan.</div>
              ) : vehicleData.length === 0 ? (
                <div className="text-gray-500 text-center">Belum ada data kendaraan untuk destinasi ini.</div>
              ) : (
                <>
                  {/* Diagram Lingkaran */}
                  <div className="w-full h-96 bg-white rounded-xl shadow border border-gray-100 p-4 mb-8 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleData}
                          dataKey="total"
                          nameKey="jenis"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${VEHICLE_LABELS[name as string] || name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {vehicleData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={VEHICLE_COLORS[idx % VEHICLE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend formatter={(value) => VEHICLE_LABELS[value] || value} />
                        <Tooltip formatter={(value, name) => [`${value} kendaraan`, VEHICLE_LABELS[name as string] || name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Tabel Data Kendaraan */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis Kendaraan</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Kendaraan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehicleData.map((row, idx) => (
                          <tr key={row.jenis}>
                            <td className="px-4 py-2 font-semibold text-gray-800">{VEHICLE_LABELS[row.jenis] || row.jenis}</td>
                            <td className="px-4 py-2 text-blue-700 font-bold text-lg">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex-1">Pendapatan Tiket per Hari</h2>
                <div className="flex gap-2 items-center">
                  <label className="font-semibold text-gray-700">Kategori:</label>
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                    value={incomeRange}
                    onChange={e => setIncomeRange(e.target.value as any)}
                  >
                    <option value="day">Per Hari</option>
                    <option value="week">Per Minggu</option>
                    <option value="month">Per Bulan</option>
                  </select>
                </div>
              </div>
              {incomeLoading ? (
                <Loading message="Memuat data pendapatan..." />
              ) : incomeError ? (
                <div className="text-red-500 text-center">{incomeError}</div>
              ) : incomeData.perDay.length === 0 ? (
                <div className="text-gray-500 text-center">Belum ada data pendapatan</div>
              ) : (
                <>
                  {/* Grafik Pendapatan per Hari */}
                  <div className="w-full h-96 bg-white rounded-xl shadow border border-gray-100 p-4 mb-8 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={incomeData.perDay.map(d => ({ ...d, tanggal: new Date(d.tanggal).toLocaleDateString('id-ID') }))} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" interval={0} height={60} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickFormatter={v => `Rp${v.toLocaleString()}`}/>
                        <Tooltip formatter={(value) => `Rp${Number(value).toLocaleString()}`} />
                        <Area type="monotone" dataKey="total" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Tabel Pendapatan per Destinasi */}
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Pendapatan Tiket per Destinasi</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destinasi Wisata</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Pendapatan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {incomeData.perDestination.map((row: any) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 font-semibold text-gray-800">{row.name}</td>
                            <td className="px-4 py-2 text-green-700 font-bold text-lg">Rp {Number(row.total).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
