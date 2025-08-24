"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Link from "next/link";
import Loading from "@/components/loading/loading";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface TouristDestination {
  id: string;
  name: string;
  address: string;
  thumbnailUrl: string | null;
  category: Category;
  averageRating?: number;
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/admin/destination-categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

const fetchDestinations = async (categoryId?: string): Promise<TouristDestination[]> => {
  let url = "/api/admin/tourist-destinations";
  if (categoryId) url += `?categoryId=${categoryId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch destinations");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
};

export default function TumbasWisataPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((e) => setError(e.message));
  }, []);

  // Gabungkan sinkronisasi URL dan fetch destinasi
  useEffect(() => {
    // Ambil categoryId dari URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlCategoryId = searchParams.get("categoryId");
    // Jika state belum sama dengan URL, update state
    if (urlCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(urlCategoryId);
      return; // Tunggu state update, fetch akan jalan di render berikutnya
    }
    // Jika sudah sinkron, fetch data
    setLoading(true);
    fetchDestinations(selectedCategoryId || undefined)
      .then((data) => {
        setDestinations(data);
        setVisibleCount(6); // Reset visible count setiap ganti kategori
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategoryId(value === "all" ? null : value);
    const params = new URLSearchParams(window.location.search);
    if (value === "all") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", value);
    }
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  // Function to render stars including half stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    const stars = [];

    // Full bintang
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      );
    }

    // Half bintang
    if (halfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 15.172L4.236 18.81c-.769.56-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967zM10 2.224v12.51l4.764 3.436c.769.56 1.838-.196 1.54-1.118l-1.287-3.966a1 1 0 00-.364-1.118L17.95 9.394c.783-.57.38-1.81-.588-1.81h-4.175a1 1 0 00-.95-.69L10 2.224z" />
        </svg>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading)
    return (
      <>
        <Navbar />
        <Loading message="Memuat daftar wisata..." />
        <Footer />
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Coba Lagi
            </button>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-center mb-4 md:mb-0">
              {selectedCategoryId ? `Kategori ${categories.find((c) => c.id === selectedCategoryId)?.name || ""}` : "Semua Kategori Wisata"}
              <span className="font-normal">({destinations.length})</span>
            </h1>
            <div className="relative">
              <select
                value={selectedCategoryId || "all"}
                onChange={handleCategoryChange}
                className="appearance-none bg-white border border-yellow-400 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black font-bold"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          {destinations.length === 0 ? (
            <div className="text-center text-gray-500">Tidak ada destinasi ditemukan.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {destinations.slice(0, visibleCount).map((dest) => (
                  <div key={dest.id} className="bg-white rounded-2xl shadow p-4 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    {/* Kategori dan logo */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {dest.category?.icon ? <img src={dest.category.icon} alt={dest.category.name} className="object-cover w-full h-full" /> : <span className="text-xs text-gray-400">Logo</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold italic">{dest.category?.name || "Kategori Wisata"}</span>
                        <span className="text-xs text-gray-500 leading-3">Dolan Bumen</span>
                      </div>
                    </div>
                    {/* Gambar utama */}
                    <div className="w-full h-36 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {dest.thumbnailUrl ? <img src={dest.thumbnailUrl} alt={dest.name} className="object-cover w-full h-full" /> : <span className="text-gray-400">No Image</span>}
                    </div>
                    {/* Rating rata kiri */}
                    <div className="flex items-center mb-1">
                      {renderStars(dest.averageRating || 0)}
                      {typeof dest.averageRating === "number" && <span className="ml-1 text-sm text-gray-700">({dest.averageRating.toFixed(1)})</span>}
                    </div>
                    {/* Nama dan alamat */}
                    <div className="w-full text-left mb-2">
                      <div className="font-bold italic text-lg">{dest.name}</div>
                      <div className="text-xs text-gray-500 italic">Alamat: {dest.address}</div>
                    </div>
                    {/* Tombol detail kanan bawah */}
                    <div className="absolute bottom-4 right-4">
                      <Link href={`/consumer/tourist-destination-details/${dest.id}`}>
                        <button className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center shadow hover:bg-yellow-400 transition">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="none" />
                            <path d="M9 6l6 6-6 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Tombol tampilkan lainnya */}
              <div className="flex justify-center mt-8">
                {visibleCount < destinations.length ? (
                  <button className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg shadow transition" onClick={() => setVisibleCount((v) => Math.min(v + 6, destinations.length))}>
                    Tampilkan Lainnya
                  </button>
                ) : destinations.length > 6 ? (
                  <span className="text-gray-500 font-semibold">Semua data sudah ditampilkan</span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
