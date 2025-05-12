"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { MapPin } from "lucide-react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/images/placeholder.jpg",
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState<boolean>(false);

  return (
    <>
      {error ? (
        <div
          className="flex items-center justify-center bg-gray-200 w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        >
          <div className="flex flex-col items-center justify-center p-4 text-gray-500">
            <MapPin className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium text-center">
              {alt || "Image not available"}
            </span>
          </div>
        </div>
      ) : (
        <Image src={src} alt={alt} onError={() => setError(true)} {...rest} />
      )}
    </>
  );
}
