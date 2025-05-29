"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { Marker } from "react-map-gl";

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <FaStar key={i} className={i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"} />
      ))}
      <span className="ml-2 font-bold text-lg">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TouristDestinationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [destination, setDestination] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(s) { setActiveIndex(s.track.details.rel); },
    slides: { perView: 1 },
  });

  // Fetch destination detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/tourist-destinations/${id}`).then(r => r.json()),
      fetch(`/api/admin/tourist-destinations/photos?destinationId=${id}`).then(r => r.json()),
      fetch(`/api/admin/tourist-destinations/${id}/reviews`).then(r => r.json()),
      fetch("/api/auth/consumer/me").then(r => r.ok ? r.json() : null)
    ]).then(([dest, photos, reviews, user]) => {
      setDestination(dest);
      setPhotos(photos);
      setReviews(reviews);
      setUser(user?.user || null);
    }).catch(e => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [id]);

  // Hitung rata-rata rating
  const avgRating = reviews.length ? (reviews.reduce((a: any, b: any) => a + b.rating, 0) / reviews.length) : 0;

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText || !reviewRating) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("comment", reviewText);
    formData.append("rating", String(reviewRating));
    const res = await fetch(`/api/admin/tourist-destinations/${id}/reviews`, {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setReviewText("");
      setReviewRating(0);
    } else {
      alert("Gagal mengirim ulasan");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error || !destination) return <div className="text-center py-20 text-red-500">{error || "Data tidak ditemukan"}</div>;

  return (
    <div className="bg-gradient-to-b from-[#F7F2EF] to-white min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-r from-[#5DB6E2] to-[#4A9BC7] py-8 px-4 md:px-0 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="group bg-yellow-300 border-2 border-yellow-400 hover:bg-yellow-400 hover:border-yellow-500 rounded-full p-3 text-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-200"
            aria-label="Kembali"
          >
            <FaArrowLeft className="text-black group-hover:-translate-x-1 transition-transform duration-300 text-2xl" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white mx-auto drop-shadow-md">Detail Objek Wisata</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Galeri & review */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Galeri dengan tombol */}
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 items-center transform transition-all duration-300 hover:shadow-2xl">
            <div className="relative w-full max-w-2xl aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center mb-2">
              {photos.length > 0 ? (
                <img
                  src={photos[activeIndex]?.filePath}
                  alt={photos[activeIndex]?.caption || `Foto ${activeIndex+1}`}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              {/* Tombol kiri */}
              {photos.length > 1 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                  onClick={() => setActiveIndex((prev) => prev === 0 ? photos.length - 1 : prev - 1)}
                  aria-label="Sebelumnya"
                >
                  &#8592;
                </button>
              )}
              {/* Tombol kanan */}
              {photos.length > 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                  onClick={() => setActiveIndex((prev) => prev === photos.length - 1 ? 0 : prev + 1)}
                  aria-label="Selanjutnya"
                >
                  &#8594;
                </button>
              )}
            </div>
            {/* Indikator bulat */}
            {photos.length > 1 && (
              <div className="flex gap-3 justify-center mt-4">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-yellow-400 scale-125" : "bg-gray-300 hover:bg-gray-400"}`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Pilih foto ${i+1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Review */}
          <div className="bg-white rounded-3xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-gray-800">Ulasan</h2>
              <StarRating rating={avgRating} />
            </div>
            {user ? (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(i => (
                    <button 
                      type="button" 
                      key={i} 
                      onClick={() => setReviewRating(i)}
                      className="transition-transform duration-200 hover:scale-110"
                    >
                      <FaStar className={i <= reviewRating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="border-2 border-gray-200 rounded-xl p-3 w-full focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  rows={3}
                  placeholder="Tulis ulasan..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={submitting || !reviewText || !reviewRating} 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-xl w-max disabled:opacity-60 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {submitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </form>
            ) : (
              <div className="mb-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">Login untuk memberikan ulasan.</div>
            )}
            <div className="flex flex-col gap-4">
              {reviews.length === 0 && <div className="text-gray-400 text-center py-4">Belum ada ulasan.</div>}
              {reviews.map((r: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:bg-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">{r.user?.name || "Anonim"}</span>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(j => (
                        <FaStar key={j} className={j <= r.rating ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"} />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">{r.comment}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-white rounded-3xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="font-bold text-xl text-gray-800 mb-4">Deskripsi</h2>
            <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{destination.description || '-'}</div>
          </div>
        </div>

        {/* Sidebar detail */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 transform transition-all duration-300 hover:shadow-2xl">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center mb-2">
              {destination.thumbnailUrl ? (
                <img 
                  src={destination.thumbnailUrl} 
                  alt={destination.name} 
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105" 
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="font-bold text-xl text-gray-800 mb-2">{destination.name}</div>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-yellow-400" /> {destination.address || '-'}</span>
            </div>
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <span>{destination.openingTime ? new Date(destination.openingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {destination.closingTime ? new Date(destination.closingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              {destination.category?.icon && <img src={destination.category.icon} alt={destination.category.name} className="w-10 h-10 rounded-full shadow-md" />}
              <span className="font-semibold text-gray-700">{destination.category?.name || '-'}</span>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 text-center text-blue-700 font-semibold shadow-inner">Selamat Berkunjung</div>
          </div>
          
          {/* Mapbox */}
          <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-3 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="font-bold text-xl text-gray-800 mb-2">Detail Lokasi</h2>
            <div className="rounded-2xl overflow-hidden mb-3 shadow-lg" style={{height: 200}}>
              {destination.latitude && destination.longitude ? (
                <Map
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                  initialViewState={{
                    latitude: Number(destination.latitude),
                    longitude: Number(destination.longitude),
                    zoom: 13,
                  }}
                  style={{ width: "100%", height: 200 }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                >
                  {destination.latitude && destination.longitude && (
                    <Marker longitude={Number(destination.longitude)} latitude={Number(destination.latitude)} anchor="bottom">
                      {destination.category?.icon ? (
                        <img
                          src={destination.category.icon}
                          alt={destination.category.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-lg bg-white object-cover"
                          style={{ transform: "translateY(-8px)" }}
                        />
                      ) : (
                        <div className="bg-yellow-400 rounded-full p-1 shadow-lg border-2 border-white">
                          <FaMapMarkerAlt className="text-black text-2xl" />
                        </div>
                      )}
                    </Marker>
                  )}
                </Map>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">Tidak ada data lokasi</div>
              )}
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">Alamat Lokasi: {destination.address || '-'}</div>
            <Link
              href={`/consumer/tourism-map?focus=${destination.id}`}
              className="block mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-xl text-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Lihat Rute Lokasi
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
