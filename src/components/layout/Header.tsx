"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User, MapIcon, Home, Ticket } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">DolanBumen</span>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-sm font-medium ${
                isActive("/")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/map"
              className={`flex items-center gap-1.5 text-sm font-medium ${
                isActive("/map")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Map</span>
            </Link>

            <Link
              href="/destinations"
              className={`flex items-center gap-1.5 text-sm font-medium ${
                pathname.startsWith("/destinations")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Destinations</span>
            </Link>

            <Link
              href="/tickets"
              className={`flex items-center gap-1.5 text-sm font-medium ${
                pathname.startsWith("/tickets")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Tickets</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
