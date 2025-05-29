"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Link from "next/link";

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
  return res.json();
};

export default function TumbasWisataPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
    const urlCategoryId = searchParams.get('categoryId');
    // Jika state belum sama dengan URL, update state
    if (urlCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(urlCategoryId);
      return; // Tunggu state update, fetch akan jalan di render berikutnya
    }
    // Jika sudah sinkron, fetch data
    setLoading(true);
    fetchDestinations(selectedCategoryId || undefined)
      .then(setDestinations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategoryId(value === 'all' ? null : value);
    const params = new URLSearchParams(window.location.search);
    if (value === 'all') {
      params.delete('categoryId');
    } else {
      params.set('categoryId', value);
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F7F2EF] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-center mb-4 md:mb-0">
              {selectedCategoryId
                ? `Kategori ${categories.find(c => c.id === selectedCategoryId)?.name || ''}`
                : "Semua Kategori Wisata"}
              <span className="font-normal">({destinations.length})</span>
            </h1>
            <div className="relative">
              <select
                value={selectedCategoryId || 'all'}
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
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-2xl shadow p-4 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Kategori dan logo */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {dest.category?.icon ? (
                      <img src={dest.category.icon} alt={dest.category.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-gray-400">Logo</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold italic">{dest.category?.name || "Kategori Wisata"}</span>
                    <span className="text-xs text-gray-500 leading-3">Dolan Bumen</span>
                  </div>
                </div>
                {/* Gambar utama */}
                <div className="w-full h-36 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {dest.thumbnailUrl ? (
                    <img src={dest.thumbnailUrl} alt={dest.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                {/* Rating rata kiri */}
                <div className="flex items-center mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className={"w-5 h-5 " + (i < 5 ? "text-yellow-400" : "text-gray-300")} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                  ))}
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
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="none"/><path d="M9 6l6 6-6 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 