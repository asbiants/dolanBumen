"use client";

import React, { useState } from "react";
import Link from "next/link";

const navLinks = [
  { name: "Beranda", href: "/beranda", active: true },
  { name: "Tumbas Wisata", href: "/" },
  { name: "Layanan", href: "#" },
  { name: "Story Map", href: "#" },
  { name: "Tourism Map", href: "#" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white flex items-center justify-between px-4 md:px-16 py-4 shadow-sm sticky top-0 z-50">
 
      <div className="flex w-full items-center justify-between md:hidden">
      
        <div className="flex-shrink-0">
          <div className="border-2 border-black rounded-md px-8 py-4 font-bold text-2xl shadow-sm bg-white">Logo</div>
        </div>
        
        <button
          className="focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span className="block w-7 h-1 bg-black mb-1 rounded transition-all" />
          <span className="block w-7 h-1 bg-black mb-1 rounded transition-all" />
          <span className="block w-7 h-1 bg-black rounded transition-all" />
        </button>
      </div>
      {/* Nabar ukuran desktop */}
      <div className="hidden md:flex items-center gap-4 w-full justify-between">
      <div className="flex-shrink-0">
          <div className="border-2 border-black rounded-md px-8 py-4 font-bold text-2xl shadow-sm bg-white">Logo</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 justify-center flex">
            <ul className="flex gap-8 items-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className={`text-lg text-black ${link.active ? "font-bold" : "font-normal"}`}>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 flex">
            <Link href="/admin/login" className="flex items-center gap-2 bg-[#FFD600] hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-md text-base transition">
              <span className="text-xl">↪</span>
              <span>Admin</span>
            </Link>
          </div>
        </div>
        
      </div>
      {/* Navbar ukuran mobile*/}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex md:hidden">
          <div className="ml-auto bg-white shadow-md p-6 flex flex-col gap-6 w-3/4 max-w-xs h-full animate-slide-in-right">
            <button
              className="self-end mb-8 text-2xl font-bold text-black"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            <ul className="flex flex-col gap-6 ">
              {navLinks.map((link) => (
                <li key={link.name} className="text-black hover:text-gray-500">
                  <Link href={link.href} onClick={() => setMenuOpen(false)}>
                    <span className={`text-lg text-black ${link.active ? "font-bold" : "font-normal"}`}>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/admin/login" className="mt-8 flex items-center gap-2 bg-[#FFD600] hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-md text-base transition">
              <span className="text-xl">↪</span>
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* efek slide nabar ketika di tampilan mobile device */}

      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </nav>
  );
} 