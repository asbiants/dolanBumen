import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tumbas Wisata Details",
};

export default function TumbasWisataDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 