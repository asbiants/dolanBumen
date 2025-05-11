"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PopupInfo } from "@/types/map";
import { X } from "lucide-react";

interface MapPopupProps {
  popupInfo: PopupInfo;
  onClose: () => void;
}

export function MapPopup({ popupInfo, onClose }: MapPopupProps) {
  const { type, data } = popupInfo;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{data.name}</CardTitle>
            <CardDescription className="text-sm">
              {type === "destination"
                ? (data as any).categoryName || "Tourist Destination"
                : (data as any).transportationTypeName ||
                  "Transportation Point"}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          {data.address && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Address:</span> {data.address}
            </p>
          )}

          {type === "destination" && (data as any).description && (
            <p className="text-sm text-gray-700 mt-2">
              {(data as any).description}
            </p>
          )}
        </CardContent>
        {type === "destination" && (
          <CardFooter className="pt-2 flex justify-between">
            <a
              href={`/destinations/${data.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Details
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Get Directions
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
