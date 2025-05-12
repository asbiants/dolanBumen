import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DolanBumen - Tourism Information System",
  description:
    "Explore tourist destinations in Kebumen with interactive maps and booking features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="py-6 bg-gray-100 border-t">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DolanBumen Tourism Information System
          </div>
        </footer>
      </body>
    </html>
  );
}
