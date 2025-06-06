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

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  ticketType: string;
  price: number;
  quotaPerDay: number;
  status: string;
}

interface TouristDestination {
  id: string;
  name: string;
  address: string; // Keep address for now, might need it in API
  thumbnailUrl: string | null;
  category: Category;
  tickets: Ticket[]; // Add tickets array
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/admin/destination-categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

// Modify fetchDestinations to fetch tickets as well
const fetchDestinationsWithTickets = async (categoryId?: string): Promise<TouristDestination[]> => {
  let url = "/api/consumer/e-tickets"; // New API endpoint
  if (categoryId) url += `?categoryId=${categoryId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch destinations with tickets");
  return res.json();
};

export default function ETicketListPage() {
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
    fetchDestinationsWithTickets(selectedCategoryId || undefined)
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  if (loading) return (
    <>
      <Navbar />
      <Loading message="Memuat daftar tiket..." />
      <Footer />
    </>
  );
  if (error) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
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
              Tiket Wisata
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

          {destinations.length === 0 ? (
            <div className="text-center text-gray-500">Tidak ada destinasi dengan tiket ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {destinations.map((dest) => {
                // Find the lowest price ticket
                const lowestPriceTicket = dest.tickets.reduce((minTicket, currentTicket) => {
                  // Ensure there's a ticket to compare with, or initialize with a high price
                  if (!minTicket) return currentTicket;
                  return currentTicket.price < minTicket.price ? currentTicket : minTicket;
                }, dest.tickets[0]); // Initialize with the first ticket, assumes tickets array is not empty if dest is included

                return (
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
                    {/* Nama dan harga tiket */}
                    <div className="w-full text-left mb-2 flex-grow">
                      <div className="font-bold italic text-lg mb-1">{dest.name}</div>
                      {dest.tickets.length > 0 ? (
                        <div className="text-sm text-gray-700 font-semibold">
                          Harga Tiket:
                          <ul className="mt-1 space-y-0.5">
                            {dest.tickets.map(ticket => (
                              <li key={ticket.id} className="text-sm text-gray-700">
                                <span className="font-normal">{ticket.ticketType}:</span>
                                <span className="ml-1 text-yellow-600">{formatPrice(ticket.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Tiket belum tersedia</div>
                      )}
                    </div>
                    {/* Tombol detail kanan bawah */}
                    <div className="absolute bottom-4 right-4">
                      <Link href={`/consumer/e-ticket-book/${dest.id}`}> {/* Link to e-ticketing detail page */}
                        <button className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center shadow hover:bg-yellow-400 transition">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
