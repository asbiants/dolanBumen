"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart,
  Users,
  MapPin,
  Ticket,
  ShoppingCart,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Check if we need to create these UI components
interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: "start" | "end" | "center";
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative">{children}</div>;
};

const DropdownMenuTrigger = ({
  asChild,
  children,
}: DropdownMenuTriggerProps) => {
  return <div>{children}</div>;
};

const DropdownMenuContent = ({
  align = "center",
  children,
}: DropdownMenuContentProps) => {
  return (
    <div className="absolute right-0 mt-2 w-56 rounded-md bg-background border shadow-lg z-50">
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  onClick,
  className,
  children,
}: DropdownMenuItemProps) => {
  return (
    <div
      className={`flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-muted ${
        className || ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-4 py-2 text-sm font-medium">{children}</div>;
};

const DropdownMenuSeparator = () => {
  return <div className="mx-2 my-1 h-px bg-muted"></div>;
};

// Avatar Components
interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
}

const Avatar = ({ className, children }: AvatarProps) => {
  return (
    <div className={`relative overflow-hidden rounded-full ${className || ""}`}>
      {children}
    </div>
  );
};

const AvatarImage = ({ src, alt }: AvatarImageProps) => {
  if (!src) return null;
  return (
    <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
  );
};

const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      {children}
    </div>
  );
};

// Badge Component
const Badge = ({
  variant,
  className,
  children,
}: {
  variant?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "outline":
        return "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/80";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getVariantClass()} ${
        className || ""
      }`}
    >
      {children}
    </span>
  );
};

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string;
}

interface AdminHeaderProps {
  user: AdminUser | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "A";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if current path matches
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu button - visible on mobile only */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Title - visible on mobile only */}
        <div className="md:hidden flex items-center">
          <h1 className="text-lg font-semibold">Dashboard Admin</h1>
        </div>

        {/* User menu and notifications */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.image || ""}
                    alt={user?.name || "Admin"}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded inline-block">
                    {user?.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : "Tourism Admin"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="space-y-1 px-4 py-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/dashboard")}
            >
              <div className="flex items-center">
                <span>Dashboard</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/users")}
            >
              <div className="flex items-center">
                <span>Pengguna</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/destinations")}
            >
              <div className="flex items-center">
                <span>Destinasi</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/tickets")}
            >
              <div className="flex items-center">
                <span>Tiket</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/orders")}
            >
              <div className="flex items-center">
                <span>Pesanan</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/admin/complaints")}
            >
              <div className="flex items-center">
                <span>Komplain</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
