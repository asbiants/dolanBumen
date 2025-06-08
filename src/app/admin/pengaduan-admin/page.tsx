"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin, User, Phone, FileText, Upload, CheckCircle, Calendar, X, Trash2 } from "lucide-react";

interface Complaint {
  id: string;
  user: { name: string; email: string };
  destination: { name: string };
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
  { value: "NEW", label: "Baru", color: "bg-gray-200 text-gray-800" },
  { value: "IN_PROGRESS", label: "Diproses", color: "bg-yellow-200 text-yellow-800" },
  { value: "RESOLVED", label: "Selesai", color: "bg-green-200 text-green-800" },
  { value: "REJECTED", label: "Ditolak", color: "bg-red-200 text-red-800" },
];

const JENIS_OPTIONS = [
  { value: "LOST_FOUND", label: "Barang Hilang" },
  { value: "KERUSAKAN", label: "Kerusakan" },
  { value: "KECELAKAAN", label: "Kecelakaan" },
];

function getStatusBadge(status: string) {
  const opt = statusOptions.find(o => o.value === status);
  if (!opt) return <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs">{status}</span>;
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${opt.color}`}>{opt.label}</span>;
}

function ComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [form, setForm] = useState({ status: "", response: "" });
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterDestination, setFilterDestination] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [destinations, setDestinations] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/api/complaints", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data.complaints) ? data.complaints : (Array.isArray(data.data) ? data.data : []);
        setComplaints(arr);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/admin/tourist-destinations")
      .then(async (res) => res.ok ? res.json() : { data: [] })
      .then((res) => setDestinations(res.data || []));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [filterDestination, filterJenis, filterStatus]);

  const openEdit = (complaint: Complaint) => {
    setSelected(complaint);
    setForm({ status: complaint.status, response: complaint.response || "" });
    setModalOpen(true);
    setAlertMsg(null);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    setAlertMsg(null);
    const res = await fetch("/api/complaints", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: selected.id, ...form }),
    });
    setSaving(false);
    if (res.ok) {
      setAlertMsg("Status/respon berhasil diupdate!");
      setComplaints(cs => cs.map(c => c.id === selected.id ? { ...c, ...form } : c));
      setModalOpen(false);
    } else {
      setAlertMsg("Gagal update status/respon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus pengaduan ini?")) return;
    setDeleting(true);
    const res = await fetch(`/api/complaints?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeleting(false);
    if (res.ok) {
      setComplaints(cs => cs.filter(c => c.id !== id));
      setModalOpen(false);
    } else {
      window.alert("Gagal menghapus pengaduan");
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Daftar Pengaduan</CardTitle>
        <CardDescription>Semua pengaduan dari user.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Section */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-4 w-full shadow-sm">
          <div className="flex flex-col gap-2 w-full md:w-60">
            <label className="font-semibold text-gray-700" htmlFor="filter-destination">Destinasi:</label>
            <select id="filter-destination" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" value={filterDestination} onChange={e => setFilterDestination(e.target.value)}>
              <option value="">Semua Destinasi</option>
              {destinations.map((d: any) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-48">
            <label className="font-semibold text-gray-700" htmlFor="filter-jenis">Jenis:</label>
            <select id="filter-jenis" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
              {JENIS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-48">
            <label className="font-semibold text-gray-700" htmlFor="filter-status">Status:</label>
            <select id="filter-status" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto">
            {(() => {
              const filtered = complaints.filter(c =>
                (!filterDestination || c.destination?.name === filterDestination) &&
                (!filterJenis || c.jenis === filterJenis) &&
                (!filterStatus || c.status === filterStatus)
              );
              return filtered.length === 0 && <div className="text-center py-8 text-gray-500">Tidak ada pengaduan.</div>;
            })()}
            <table className="w-full border rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 font-semibold">Pelapor</th>
                  <th className="py-2 px-3 font-semibold">Tempat</th>
                  <th className="py-2 px-3 font-semibold">Jenis</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Respon</th>
                  <th className="py-2 px-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = complaints.filter(c =>
                    (!filterDestination || c.destination?.name === filterDestination) &&
                    (!filterJenis || c.jenis === filterJenis) &&
                    (!filterStatus || c.status === filterStatus)
                  );
                  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                  return paged.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{c.user?.name}</td>
                      <td className="py-2 px-3">{c.destination?.name}</td>
                      <td className="py-2 px-3">{c.jenis}</td>
                      <td className="py-2 px-3">{getStatusBadge(c.status)}</td>
                      <td className="py-2 px-3 max-w-xs truncate">{c.response || <span className="text-gray-400">-</span>}</td>
                      <td className="py-2 px-3 flex gap-2 items-center">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} disabled={deleting}>
                          <Trash2 className="w-4 h-4 mr-1" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            {/* Pagination */}
            {(() => {
              const filtered = complaints.filter(c =>
                (!filterDestination || c.destination?.name === filterDestination) &&
                (!filterJenis || c.jenis === filterJenis) &&
                (!filterStatus || c.status === filterStatus)
              );
              if (filtered.length > itemsPerPage) {
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                return (
                  <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                    <div className="text-sm text-gray-600">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
        {/* Modal Edit */}
        {modalOpen && selected && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-2">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Edit Pengaduan</h2>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span className="font-medium">{selected.user?.name}</span> <span className="text-xs text-gray-500">({selected.user?.email})</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span>{selected.destination?.name}</span></div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> <span>Jenis:</span> <span className="font-medium">{selected.jenis}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span>Narahubung:</span> <span className="font-medium">{selected.narahubung}</span></div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> <span>Deskripsi:</span> <span className="font-medium">{selected.deskripsi}</span></div>
                <div className="flex items-center gap-2"><Upload className="w-4 h-4" /> <span>Foto:</span> {selected.attachment ? <a href={selected.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a> : <span className="text-gray-400">-</span>}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span>Lokasi:</span> <span className="font-medium">{selected.longitude}, {selected.latitude}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>Tanggal:</span> <span className="font-medium">{new Date(selected.createdAt).toLocaleString()}</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> <span>Status:</span> {getStatusBadge(form.status)}</div>
              </div>
              <hr className="my-3" />
              <div className="mb-3">
                <label className="font-semibold flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-600" /> Ubah Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded px-2 py-1 mt-1">
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="font-semibold flex items-center gap-2 mb-1"><FileText className="w-4 h-4" />Respon Admin</label>
                <textarea value={form.response} onChange={e => setForm(f => ({ ...f, response: e.target.value }))} rows={2} className="w-full border rounded px-2 py-1 mt-1" placeholder="Tulis respon admin..." />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full justify-between">
                <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 text-white flex-1 min-w-0">{saving ? "Menyimpan..." : "Update"}</Button>
                <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 min-w-0">Batal</Button>
                <Button variant="destructive" onClick={() => handleDelete(selected.id)} className="flex-1 min-w-0" disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {alertMsg && <div className="mb-2 text-center text-sm text-green-700 bg-green-100 rounded p-2">{alertMsg}</div>}
      </CardContent>
    </Card>
  );
}

export default function PengaduanAdminPage() {
  return (
    <div className="space-y-6 min-h-screen bg-gray-50 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Dashboard Pengaduan Admin</h1>
      <ComplaintList />
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}
