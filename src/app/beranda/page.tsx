"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import { Qwitcher_Grypen } from "next/font/google";

const qwitcher = Qwitcher_Grypen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-qwitcher",
});

const scrollAnimation = () => {
  const elements = document.querySelectorAll(".animate-on-scroll");
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("opacity-100", "translate-y-0");
      el.classList.remove("opacity-0", "translate-y-8");
    }
  });
};

export default function Beranda() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Sistem Informasi Pariwisata";

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

  return (
    <>
      <Navbar />
      <main className="bg-[#FAF7F3] min-h-screen font-sans">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] md:h-[600px] bg-gray-300 flex flex-col justify-center items-start px-8 md:px-32 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {typedText}
            <span className="inline-block w-2 h-6 bg-black align-bottom animate-pulse ml-1" style={{visibility: typedText.length === fullText.length ? 'hidden' : 'visible'}}></span>
          </h1>
          <p className="text-lg md:text-xl mb-4">Kabupaten Kebumen</p>
          <button className="bg-[#AEE1D6] px-6 py-2 rounded-md font-semibold text-sm hover:bg-[#8fd1c2] transition">Jelajahi →</button>
        </section>

        {/* Mengenal Section */}
        <section className="py-16 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className={`text-5xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Mengenal</h2>
          <h3 className="text-2xl md:text-3xl font-bold mb-8">Kabupaten Kebumen</h3>
          <div className="flex flex-col md:flex-row gap-8 w-full items-center">
            <div className="w-full md:w-1/2 h-56 bg-gray-300 rounded-xl" />
            <div className="w-full md:w-1/2">
              <h4 className="text-[#BBA14F] font-semibold mb-2">Kebumen</h4>
              <p className="text-sm text-gray-700 mb-4">
                nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat.
              </p>
              <button className="bg-[#1A2530] text-white px-6 py-2 rounded-md font-semibold text-sm hover:bg-[#2B4C7E] transition">See All →</button>
            </div>
          </div>
        </section>

        {/* Kategori Pariwisata Section */}
        <section className="py-16 px-4 md:px-32 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h3 className="text-xl md:text-2xl font-bold mb-2">Beragam Jenis</h3>
          <p className="italic text-lg text-gray-700 mb-8">Kategori Pariwisata</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl shadow p-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg" />
                <div>
                  <div className="font-semibold">Kategori Wisata</div>
                  <div className="text-xs text-gray-500">10 Objek Wisata</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button className="bg-[#1A2530] text-white px-6 py-2 rounded-md font-semibold text-sm hover:bg-[#2B4C7E] transition">See All →</button>
          </div>
        </section>

        {/* Tentang Aplikasi Section */}
        <section className="py-16 px-4 md:px-32 flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className={`text-5xl text-[#2B4C7E] italic font-bold mb-2 ${qwitcher.className}`}>Tentang</h2>
          <h3 className="text-2xl md:text-3xl font-bold mb-8">Aplikasi Dolan Bumen</h3>
          <div className="w-full flex flex-col items-center">
            <div className="w-full md:w-2/3 h-56 bg-gray-300 rounded-xl mb-6" />
            <p className="text-sm text-gray-700 text-center">
              nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat. lorem, varius at, odio Donec laoreet id odio vitae diam tortor, non tortor, urna. vitae cursus Nam venenatis varius tortor, nisi sed viverra dolor non quis Cras urna Nunc dignissim, nec consectetur nibh in nec non risus viverra placerat.
            </p>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="bg-[#1A2530] text-white py-12 px-4 md:px-32 mt-16">
          <div className="flex flex-col items-center">
            <div className="bg-white text-black rounded-md px-8 py-4 mb-4 font-semibold">Logo Website</div>
            <p className="mb-4 text-center">Portal dan Layanan Informasi Pariwisata Kabupaten Kebumen</p>
            <div className="flex gap-4 mb-4">
              <span className="text-2xl">ⓕ</span>
              <span className="text-2xl">ⓧ</span>
              <span className="text-2xl">ⓣ</span>
            </div>
            <p className="text-xs">©2025 Copyright By Dolan Bumen</p>
          </div>
        </footer>
      </main>
    </>
  );
} 