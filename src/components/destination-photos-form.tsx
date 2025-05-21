import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

interface DestinationPhotosFormProps {
  destinationId: string;
  onSuccess?: () => void;
}

export function DestinationPhotosForm({
  destinationId,
  onSuccess
}: DestinationPhotosFormProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);

    try {
      const formData = new FormData(form);
      formData.append("destinationId", destinationId);

      const response = await fetch("/api/admin/tourist-destinations/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      toast.success("Photo uploaded successfully");
      form.reset();
      setPreview(null);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="photo">Photo</Label>
        <Input
          id="photo"
          type="file"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          required
        />
        {preview && (
          <div className="relative aspect-video w-full">
            <Image
              src={preview}
              alt="Preview"
              className="object-cover rounded-lg"
              fill
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          name="caption"
          placeholder="Enter photo caption..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoType">Photo Type</Label>
        <Select name="photoType" defaultValue="GALLERY">
          <SelectTrigger>
            <SelectValue placeholder="Select photo type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MAIN">Main Photo</SelectItem>
            <SelectItem value="GALLERY">Gallery Photo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </>
        )}
      </Button>
    </form>
  );
} 