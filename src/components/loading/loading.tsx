import React from 'react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Memuat..." }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
} 