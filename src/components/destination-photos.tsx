import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DestinationPhoto {
  id: string;
  filePath: string;
  caption: string | null;
  photoType: "MAIN" | "GALLERY";
  createdAt: string;
}

interface DestinationPhotosProps {
  destinationId: string;
}

export function DestinationPhotos({ destinationId }: DestinationPhotosProps) {
  const [photos, setPhotos] = useState<DestinationPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `/api/admin/tourist-destinations/photos?destinationId=${destinationId}`
        );
        if (!response.ok) throw new Error("Failed to fetch photos");
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [destinationId]);

  if (loading) {
    return <div>Loading photos...</div>;
  }

  if (photos.length === 0) {
    return <div>No photos available</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={photo.filePath}
              alt={photo.caption || "Destination photo"}
              className="object-cover transition-transform group-hover:scale-105"
              fill
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <Badge variant={photo.photoType === "MAIN" ? "default" : "secondary"}>
                {photo.photoType}
              </Badge>
              {photo.caption && (
                <p className="mt-2 text-sm text-white">{photo.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 