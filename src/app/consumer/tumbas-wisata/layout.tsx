import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tumbas Wisata",
};

export default function TumbasWisataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 