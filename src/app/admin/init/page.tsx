"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

//validasi skema form login, mengatur agar email dan password yang diinputkan sesuai dengan ketentuan
const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Must be a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminInitPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); //fungsi untuk menampilkank dan menghide password pada form
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuperAdminExists, setIsSuperAdminExists] = useState(false);

  // inisialisasi form dari skema yang sudah dibuat menggunakan "zod"
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //fungsi untuk mengecek apakah super admin sudah ada atau belum
  const checkSuperAdmin = async () => {
    try {
      //memanggil API check init untuk mengecek apakah super admin sudah ada atau belum dengan metode GET
      const response = await fetch("/api/admin/init/check", {
        method: "GET",
      });

      const data = await response.json();
      if (data.exists) {
        //jika super admin ada didalam database, mengubah nilai state dari setIsSuperAdminExist menjadi true (default di setting false)
        setIsSuperAdminExists(true);
      }
    } catch (error) {
      console.error("Error checking super admin:", error);
    }
  };

  // memanggil checkSuperAdmin untuk dijalankan dengan menggunakan useEffect
  useEffect(() => {
    checkSuperAdmin();
  }, []);

  // handle form submit
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setApiError(null);

    try {
      //mengarahkan ke API init untuk menginisiasi apakah memiliki akses atau tidak ke halaman register ssuper admin
      const response = await fetch("/api/admin/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create super admin");
      }

      // apabila berhasil langsung di redirect ke halaman login
      router.push("/admin/login?success=true");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // tampilan antar muka pengguna apabila akun super admin terdapat pada sistem
  if (isSuperAdminExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Super Admin Sudah Ada</CardTitle>
            <CardDescription>Akun super admin sudah dibuat untuk sistem ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>Halaman inisialisasi hanya dapat diakses ketika belum ada akun super admin yang dibuat</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push("/admin/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inisialisasi Super Admin</CardTitle>
          <CardDescription>Daftar Super Admin. Halaman ini hanya dapat diakses ketika Super Admin tidak ada.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {apiError && (
                <Alert variant="destructive">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input placeholder="email@example.com" className="pl-10" {...field} disabled={isLoading} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10" {...field} disabled={isLoading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Super Admin Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
