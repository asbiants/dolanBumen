"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import { Qwitcher_Grypen } from "next/font/google";
import Footer from "@/components/footer/footer";
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        const [catRes, destRes] = await Promise.all([fetch("/api/admin/destination-categories"), fetch("/api/admin/tourist-destinations")]);
        if (!catRes.ok || !destRes.ok) throw new Error("Failed to fetch data");
        const [catData, destData] = await Promise.all([catRes.json(), destRes.json()]);
        setCategories(Array.isArray(catData.data) ? catData.data : catData);
        setDestinations(Array.isArray(destData.data) ? destData.data : []);
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
      <main className="min-h-screen font-sans">
        {/* Hero Section */}
        <section className="relative w-full min-h-[70vh] flex flex-col justify-center items-center px-4 md:px-0 animated-gradient-bg">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-24">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center mb-6 leading-tight tracking-tight" style={{ letterSpacing: "-0.03em" }}>
              Dolan Bumen, Jelajahi Berbagai Destinasi Wisata di Kebumen!
            </h1>
            <p className="text-lg md:text-2xl text-white/80 text-center mb-8 font-light max-w-2xl">Temukan destinasi wisata terbaik, keindahan alam, dan budaya di Kabupaten Kebumen.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-10">
              <button
                className="bg-[#AEE1D6] hover:bg-[#8fd1c2] text-[#1A2530] font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AEE1D6]"
                onClick={() => router.push("/consumer/tourism-map")}
              >
                Jelajahi Sekarang
              </button>
              <button
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                onClick={() => router.push("/consumer/tumbas-wisata")}
              >
                Lihat Semua Kategori
              </button>
            </div>
          </div>
        </section>

        {/* Mengenal Section */}
        <section className="py-24 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className={`text-6xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Mengenal</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Kabupaten Kebumen</h3>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-12 w-full items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/sempor3.jpg" alt="Kebumen" className="w-full h-[400px] object-cover transform hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2">
              <h4 className="text-[#BBA14F] text-xl font-semibold mb-4">Kebumen</h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                Kabupaten Kebumen, yang terletak di bagian selatan Provinsi Jawa Tengah, merupakan daerah yang kaya akan potensi pariwisata dengan keindahan alam yang memukau serta kekayaan budaya yang khas. Dikenal dengan pantai-pantainya
                yang eksotis seperti Pantai Menganti dan Pantai Suwuk, Kebumen juga memiliki pesona wisata alam lainnya seperti Goa Jatijajar, Sagara View, dan Geopark Karangsambung-Karangbolong yang menyimpan nilai geologi penting. Selain
                itu, keramahan masyarakat lokal dan kekayaan kuliner tradisional turut menjadi daya tarik tersendiri bagi para wisatawan yang ingin menikmati pengalaman liburan yang autentik dan berkesan
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#1A2530] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#2B4C7E] transition shadow-lg" onClick={() => router.push("/consumer/story-map")}>
                Lihat Selengkapnya →
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Kategori Pariwisata Section */}
        <section className="py-24 px-4 md:px-32 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
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
                  const destinationCount = destinations.filter((dest) => dest.categoryId === category.id).length;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`flex items-center gap-4 bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 ${activeCategory === category.id ? "ring-2 ring-[#2B4C7E]" : ""}`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        router.push(`/consumer/tumbas-wisata?categoryId=${category.id}`);
                      }}
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                        {category.icon ? <img src={category.icon} alt={category.name} className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400">No Icon</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">{category.name}</div>
                        <div className="text-sm text-gray-500">{destinationCount} Objek Wisata</div>
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
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="bg-[#1A2530] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#2B4C7E] transition shadow-lg"
                  >
                    {showAllCategories ? "Tampilkan Sedikit" : "Lihat Semua Kategori"} →
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Tentang Aplikasi Section */}
        <section className="py-24 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className={`text-6xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Tentang</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Aplikasi Dolan Bumen</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full max-w-4xl">
            <img src="/hero/Hero-DolanBumen.png" alt="Dolan Bumen App" className="w-full max-w-md h-[400px] mx-auto object-contain transition-transform duration-700 hover:scale-105 mb-2" />
            <p className="text-gray-700 leading-relaxed text-center">
              Aplikasi Dolan Bumen adalah platform digital berbasis website yang menyediakan informasi dan layanan terkait pariwisata di Kabupaten Kebumen, Jawa Tengah. Aplikasi ini bertujuan untuk memudahkan wisatawan dalam menemukan dan
              menikmati keindahan alam, budaya, dan destinasi wisata terbaik di Kebumen. Temukan beragam destinasi wisata dan aktivitas yang menarik di Kebumen melalui aplikasi ini.
            </p>
          </motion.div>
        </section>

        {/* Footer Section */}
        <Footer />
      </main>
      <style jsx global>{`
        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-marquee-right {
          display: inline-flex;
          min-width: 200%;
          animation: marquee-right 30s linear infinite;
        }
        .animated-gradient-bg {
          background: linear-gradient(120deg, #1a2530, #2b4c7e, #aee1d6, #bba14f, #1a2530);
          background-size: 300% 300%;
          animation: gradientMove 10s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
}
