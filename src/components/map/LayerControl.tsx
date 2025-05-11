"use client";

import { LayerControl as LayerControlType } from "@/types/map";
import {
  Layers,
  MapPin,
  Navigation,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface LayerControlProps {
  layerControl: LayerControlType;
  onToggleLayer: (layer: keyof LayerControlType) => void;
}

export function LayerControl({
  layerControl,
  onToggleLayer,
}: LayerControlProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
        <Layers className="w-4 h-4" />
        <span>Map Layers</span>
      </h3>

      <button
        onClick={() => onToggleLayer("destinations")}
        className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-gray-100"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>Destinations</span>
        </div>
        {layerControl.destinations ? (
          <ToggleRight className="w-5 h-5 text-indigo-600" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <button
        onClick={() => onToggleLayer("transportation")}
        className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-gray-100"
      >
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-blue-600" />
          <span>Transportation</span>
        </div>
        {layerControl.transportation ? (
          <ToggleRight className="w-5 h-5 text-blue-600" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <button
        onClick={() => onToggleLayer("districts")}
        className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-gray-100"
      >
        <div className="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span>Districts</span>
        </div>
        {layerControl.districts ? (
          <ToggleRight className="w-5 h-5 text-green-600" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  );
}
