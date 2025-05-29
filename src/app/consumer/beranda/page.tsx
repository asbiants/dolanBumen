"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import { Qwitcher_Grypen } from "next/font/google";
import Footer from "@/components/footer/footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const qwitcher = Qwitcher_Grypen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-qwitcher",
});

const scrollAnimation = () => {
  const elements = document.querySelectorAll(".animate-on-scroll");
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      el.classList.add("opacity-100", "translate-y-0");
      el.classList.remove("opacity-0", "translate-y-8");
    }
  });
};

interface DestinationCategory {
  id: string;
  name: string;
  icon?: string | null;
}

export default function Beranda() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Sistem Informasi Pariwisata";
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [defaultCategoryCount, setDefaultCategoryCount] = useState(6);
  const router = useRouter();

  // Responsive default category count
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setDefaultCategoryCount(3);
      } else {
        setDefaultCategoryCount(6);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => scrollAnimation();
    window.addEventListener("scroll", handleScroll);
    scrollAnimation();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories & destinations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, destRes] = await Promise.all([
          fetch("/api/admin/destination-categories"),
          fetch("/api/admin/tourist-destinations")
        ]);
        if (!catRes.ok || !destRes.ok) throw new Error("Failed to fetch data");
        const [catData, destData] = await Promise.all([
          catRes.json(),
          destRes.json()
        ]);
        setCategories(catData);
        setDestinations(destData);
      } catch (error) {
        console.error("[FETCH_CATEGORIES_DESTINATIONS_ERROR]", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  // Get visible categories based on showAllCategories state and responsive count
  const visibleCategories = showAllCategories ? categories : categories.slice(0, defaultCategoryCount);

  return (
    <>
      <Navbar />
      <main className="bg-[#FAF7F3] min-h-screen font-sans">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex flex-col justify-center items-start px-8 md:px-32 overflow-hidden">
          {/* Background image with parallax effect */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
            <div 
              className="w-full h-full bg-cover bg-center bg-fixed"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')",
                transform: "translateZ(-1px) scale(2)",
              }}
            />
          </div>
          
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col gap-4"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
              {typedText}
              <span className="inline-block w-2 h-8 bg-white align-bottom animate-pulse ml-1" style={{visibility: typedText.length === fullText.length ? 'hidden' : 'visible'}}></span>
            </h1>
            <p className="text-xl md:text-3xl text-white/90 mb-2 drop-shadow font-light">Kabupaten Kebumen, Jawa Tengah</p>
            <p className="text-base md:text-xl text-white/80 max-w-xl mb-6 drop-shadow font-light">
              Temukan keindahan alam, budaya, dan destinasi wisata terbaik di Kebumen. Jelajahi pengalaman tak terlupakan bersama Dolan Bumen!
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="self-start bg-[#AEE1D6] hover:bg-[#8fd1c2] text-[#1A2530] font-bold px-8 py-3 rounded-lg text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
            >
              Jelajahi Sekarang →
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 bg-white/50 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </section>

        {/* Mengenal Section */}
        <section className="py-24 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-6xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Mengenal</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Kabupaten Kebumen</h3>
          </motion.div>
          
          <div className="flex flex-col md:flex-row gap-12 w-full items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" 
                  alt="Kebumen" 
                  className="w-full h-[400px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/2"
            >
              <h4 className="text-[#BBA14F] text-xl font-semibold mb-4">Kebumen</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1A2530] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#2B4C7E] transition shadow-lg"
              >
                Lihat Selengkapnya →
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Kategori Pariwisata Section */}
        <section className="py-24 px-4 md:px-32 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 bg-gradient-to-b from-[#FAF7F3] to-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Beragam Jenis</h3>
            <p className={`text-6xl text-[#2B4C7E] italic font-bold ${qwitcher.className}`}>Kategori Pariwisata</p>
          </motion.div>

          {isLoadingCategories ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2B4C7E]"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {visibleCategories.map((category, index) => {
                  const destinationCount = destinations.filter(
                    (dest) => dest.categoryId === category.id
                  ).length;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`flex items-center gap-4 bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 ${
                        activeCategory === category.id ? 'ring-2 ring-[#2B4C7E]' : ''
                      }`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        router.push(`/consumer/tumbas-wisata?categoryId=${category.id}`);
                      }}
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                        {category.icon ? (
                          <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm text-gray-400">No Icon</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          {destinationCount} Objek Wisata
                        </div>
                      </div>
                      <div className="text-[#2B4C7E]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {categories.length > defaultCategoryCount && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="bg-[#1A2530] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#2B4C7E] transition shadow-lg"
                  >
                    {showAllCategories ? 'Tampilkan Sedikit' : 'Lihat Semua Kategori'} →
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Tentang Aplikasi Section */}
        <section className="py-24 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-6xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Tentang</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Aplikasi Dolan Bumen</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
              <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" 
                alt="Dolan Bumen App" 
                className="w-full h-[400px] object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <p className="text-gray-700 leading-relaxed text-center">
              nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat.
            </p>
          </motion.div>
        </section>

        {/* Footer Section */}
        <Footer />
      </main>
    </>
  );
} 