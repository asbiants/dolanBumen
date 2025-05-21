"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DestinationCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
}

interface FormData {
  name: string;
  description: string;
  icon: string | File;
}

export default function DestinationCategoriesPage() {
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    icon: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/destination-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      
      // Only append icon if it's a File object
      if (formData.icon instanceof File) {
        formDataToSend.append("icon", formData.icon);
      }

      const url = selectedCategory
        ? `/api/admin/destination-categories/${selectedCategory.id}`
        : "/api/admin/destination-categories";
      
      const response = await fetch(url, {
        method: selectedCategory ? "PUT" : "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save category");
      }

      toast.success(
        selectedCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/destination-categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  // Handle edit
  const handleEdit = (category: DestinationCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update formData with the File object
    setFormData(prev => ({ ...prev, icon: file }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Destination Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {formData.icon && (
                    <img
                      src={formData.icon}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-8 h-8 object-cover rounded"
                      onError={(e) => {
                        console.error("Image load error:", category.icon); // Debug log
                        e.currentTarget.src = "/placeholder.png"; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No icon</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 