"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { name: "Beranda", href: "/consumer/beranda", active: true },
  { name: "Tumbas Wisata", href: "/consumer/tumbas-wisata" },
  { name: "Layanan", dropdown: true, items: [
    { name: "E-Ticketing", href: "/consumer/e-ticketing" },
    { name: "Pengaduan", href: "/consumer/pengaduan" },
  ] },
  { name: "Story Map", href: "#" },
  { name: "Tourism Map", href: "/consumer/tourism-map" },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [admin, setAdmin] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Cek consumer
        const consumerRes = await fetch("/api/auth/consumer/me", { credentials: "include" });
        if (consumerRes.ok) {
          const data = await consumerRes.json();
          setUser(data.user);
        }
      } catch (error) {
        // ignore
      }
      try {
        // Cek admin
        const adminRes = await fetch("/api/auth/admin/me", { credentials: "include" });
        if (adminRes.ok) {
          const data = await adminRes.json();
          setAdmin(data.user);
        } else {
          setAdmin(null);
        }
      } catch (error) {
        setAdmin(null);
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      if (admin) {
        await fetch("/api/auth/admin/logout", { method: "POST" });
        setAdmin(null);
        router.push("/admin/login");
      } else {
        await fetch("/api/auth/consumer/logout", { method: "POST" });
        setUser(null);
        router.push("/consumer/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="w-full bg-white flex items-center justify-between px-4 md:px-12 lg:px-32 py-4 shadow-sm sticky top-0 z-50">
      {/* Mobile menu button */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex-shrink-0">
          <Link href="/beranda">
            <Image
              src="/logo/Logo-dolanBumen.svg"
              alt="Dolan Bumen Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
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

      {/* Desktop navbar */}
      <div className="hidden lg:flex items-center gap-4 w-full justify-between">
        <div className="flex-shrink-0">
          <Link href="/beranda">
            <Image
              src="/logo/Logo-dolanBumen.svg"
              alt="Dolan Bumen Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 justify-center flex">
            <ul className="flex gap-4 md:gap-8 items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.dropdown) {
                  return (
                    <li key={link.name} className="relative group">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="nav-underline text-lg transition-all duration-200 px-1 font-normal text-black cursor-pointer flex items-center gap-1">
                            {link.name}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {link.items.map((item) => (
                            <DropdownMenuItem asChild key={item.name}>
                              {item.href && (
                                <Link href={item.href}>
                                  <span className={`nav-underline text-lg transition-all duration-200 px-1 font-normal text-black`}>
                                    {item.name}
                                  </span>
                                </Link>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                }
                return (
                  <li key={link.name}>
                    {link.href && (
                      <Link href={link.href}>
                        <span
                          className={`nav-underline text-lg transition-all duration-200 px-1
                            ${isActive ? "font-bold text-blue-700 nav-underline-active" : "font-normal text-black"}
                          `}
                        >
                          {link.name}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex-shrink-0 flex items-center gap-4">
            {!isLoading && (
              <>
                {admin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {admin.name?.charAt(0).toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{admin.name} ({admin.role})</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/consumer/dashboard" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link href="/consumer/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/consumer/register">
                      <Button>Daftar</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
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
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.dropdown) {
                  const isDropdownOpen = openMobileDropdown === link.name;
                  return (
                    <li key={link.name} className="flex flex-col">
                      <button
                        className="text-black font-normal text-lg flex items-center gap-1 focus:outline-none py-2"
                        onClick={() => setOpenMobileDropdown(isDropdownOpen ? null : link.name)}
                        aria-expanded={isDropdownOpen}
                        aria-controls={`dropdown-${link.name}`}
                        type="button"
                      >
                        {link.name}
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isDropdownOpen && (
                        <ul id={`dropdown-${link.name}`} className="ml-4 flex flex-col gap-1 pb-2">
                          {link.items.map((item) => (
                            <li key={item.name}>
                              {item.href && (
                                <Link href={item.href} onClick={() => { setMenuOpen(false); setOpenMobileDropdown(null); }}>
                                  <span className={`nav-underline text-lg transition-all duration-200 px-1 font-normal text-black block py-1 pl-2`}>
                                    {item.name}
                                  </span>
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={link.name} className="text-black hover:text-gray-500">
                    {link.href && (
                      <Link href={link.href} onClick={() => setMenuOpen(false)}>
                        <span
                          className={`nav-underline text-lg transition-all duration-200 px-1
                            ${isActive ? "font-bold text-blue-700 nav-underline-active" : "font-normal text-black"}
                          `}
                        >
                          {link.name}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            {!isLoading && (
              <div className="flex flex-col gap-4 mt-4">
                {admin ? (
                  <>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-black hover:text-gray-500" onClick={() => setMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : user ? (
                  <>
                    <Link href="/consumer/dashboard" className="flex items-center gap-2 text-black hover:text-gray-500" onClick={() => setMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/consumer/login" className="flex items-center gap-2 text-black hover:text-gray-500" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                    <Link href="/consumer/register" className="flex items-center gap-2 text-black hover:text-gray-500" onClick={() => setMenuOpen(false)}>
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide animation styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-underline {
          position: relative;
          cursor: pointer;
        }
        .nav-underline::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -2px;
          transform: translateX(-50%) scaleX(0);
          transform-origin: center;
          width: 80%;
          height: 3px;
          background: #2563eb; /* blue-600 */
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-underline:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-underline-active::after {
          transform: translateX(-50%) scaleX(1);
        }
      `}</style>
    </nav>
  );
} 