import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { DestinationPhotosForm } from "./destination-photos-form";
import { DestinationPhotos } from "./destination-photos";
import { useState } from "react";

interface DestinationPhotosDialogProps {
  destinationId: string;
  destinationName: string;
}

export function DestinationPhotosDialog({
  destinationId,
  destinationName,
}: DestinationPhotosDialogProps) {
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ImagePlus className="mr-2 h-4 w-4" />
          Manage Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Destination Photos</DialogTitle>
          <DialogDescription>
            Add or view photos for {destinationName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Upload New Photo</h3>
            <DestinationPhotosForm
              destinationId={destinationId}
              onSuccess={handleSuccess}
            />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Existing Photos</h3>
            <DestinationPhotos key={key} destinationId={destinationId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 