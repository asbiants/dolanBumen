import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda | Dolan Bumen",
};

export default function BerandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 