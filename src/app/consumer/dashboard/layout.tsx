import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Dolan Bumen",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 