"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, FileText, User, MessageSquare } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Complaint {
  id: string;
  jenis: string;
  deskripsi: string;
  status: string;
  response: string | null;
  responseDate: Date | null;
  createdAt: Date;
  destination: {
    name: string;
  };
  admin: {
    name: string;
  } | null;
  fileUrl: string | null;
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const router = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${id}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data pengaduan");
        }
        const data = await response.json();
        setComplaint(data.complaint);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchComplaint();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu';
      case 'PROCESSING':
        return 'Diproses';
      case 'RESOLVED':
        return 'Selesai';
      case 'REJECTED':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  if (!complaint) return null;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Detail Pengaduan</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Nomor Tiket Pengaduan: <span className="font-mono font-semibold">{complaint.id}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {getStatusText(complaint.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium">{complaint.destination.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Pengaduan</p>
                      <p className="font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Jenis Pengaduan</p>
                      <p className="font-medium">{complaint.jenis}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Ditangani Oleh</p>
                      <p className="font-medium">{complaint.admin?.name || 'Belum ada'}</p>
                    </div>
                  </div>
                  {complaint.responseDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Respon</p>
                        <p className="font-medium">
                          {new Date(complaint.responseDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Deskripsi Pengaduan</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{complaint.deskripsi}</p>
              </div>

              {complaint.fileUrl && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Dokumentasi</h3>
                  <img
                    src={complaint.fileUrl}
                    alt="Dokumentasi pengaduan"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {complaint.response && (
                <div className="border-t pt-6">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Respon dari Admin</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{complaint.response}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 