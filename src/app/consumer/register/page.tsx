"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/navbar/navbar";

// Validation schema
const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConsumerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      address: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/consumer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      // Redirect to login page on success
      router.push("/consumer/login?registered=true");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <Card className="w-full max-w-md shadow-xl rounded-2xl border-0">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <Image src="/logo/Logo-dolanBumen.svg" alt="Logo DolanBumen" width={120} height={60} className="mb-2" />
            <CardTitle className="text-2xl font-bold text-center">Daftar</CardTitle>
            <CardDescription className="text-center">Buat akun baru</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input placeholder="Nama lengkap" className="pl-10" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input placeholder="08123456789" className="pl-10" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input placeholder="Alamat lengkap" className="pl-10" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Daftar"}
                </Button>

                <div className="text-center text-sm">
                  Sudah punya akun?{" "}
                  <Link href="/consumer/login" className="text-blue-600 hover:underline">
                    Login di sini
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 