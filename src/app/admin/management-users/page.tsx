"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Role, UserStatus } from '@prisma/client'; // Import Prisma enums
import { Trash2 } from 'lucide-react'; // Import Trash2 icon

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role; // Use imported Role enum
  status: UserStatus; // Use imported UserStatus enum
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "" });
  const [creatingUser, setCreatingUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null); // State to track which user is being deleted

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/management-user");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        alert("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("An unexpected error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      alert("Please fill in all fields");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/management-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Tourism Admin user created successfully.");
        setUsers([data.user, ...users]);
        setNewUserForm({ name: "", email: "", password: "" });
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("An unexpected error occurred while creating the user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setDeletingUserId(userId); // Set the ID of the user being deleted
    try {
      const res = await fetch(`/api/admin/management-user?id=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("User deleted successfully.");
        setUsers(users.filter(user => user.id !== userId)); // Remove user from the list
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("An unexpected error occurred while deleting the user.");
    } finally {
      setDeletingUserId(null); // Clear the deleting state
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Pengguna Sistem</CardTitle>
            <CardDescription>Lihat dan kelola pengguna terdaftar (Konsumen & Admin Pariwisata).</CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Admin Pariwisata</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daftarkan Admin Pariwisata Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nama</Label>
                  <Input id="name" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser} disabled={creatingUser}>{creatingUser ? "Mendaftarkan..." : "Daftarkan"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.role !== Role.SUPER_ADMIN && (
                           <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleDeleteUser(user.id)}
                             disabled={deletingUserId === user.id}
                           >
                            {deletingUserId === user.id ? 'Menghapus...' : <Trash2 className="h-4 w-4" />}
                           </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
