"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@/hooks/useMap";
import { MapPopup } from "@/components/map/MapPopup";
import { LayerControl } from "@/components/map/LayerControl";
import { MapFilter } from "@/components/map/MapFilter";
import { Destination, TransportPoint } from "@/types/map";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapContainerProps {
  destinations?: Destination[];
  transportationPoints?: TransportPoint[];
  districtGeoJSON?: GeoJSON.FeatureCollection;
  showLayerControl?: boolean;
  showFilter?: boolean;
  height?: string;
  className?: string;
  mapInstanceId?: string;
}

export function MapContainer({
  destinations = [],
  transportationPoints = [],
  districtGeoJSON,
  showLayerControl = true,
  showFilter = true,
  height = "h-[600px]",
  className = "",
  mapInstanceId,
}: MapContainerProps) {
  // Generate a static ID if none provided to avoid remounting issues
  const localMapId = useRef(
    `map-container-${Math.random().toString(36).substring(2, 9)}`
  );
  const mapContainerId = mapInstanceId || localMapId.current;

  // Keep track of component state
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);

  // Get Mapbox token
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError(
        "Mapbox access token not found. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file."
      );
      return;
    }
    setMapToken(token);

    // Check if the element exists
    const checkElement = () => {
      const element = document.getElementById(mapContainerId);
      if (element) {
        console.log(`Map container element found: ${mapContainerId}`);
        setElementReady(true);
      } else {
        console.log(`Waiting for map container element: ${mapContainerId}`);
        setTimeout(checkElement, 100);
      }
    };

    // Start checking after a short delay to ensure component is mounted
    setTimeout(checkElement, 100);
  }, [mapContainerId]);

  // Initialize map with the useMap hook once element is ready
  const {
    isLoaded,
    layerControl,
    popupInfo,
    addDestinations,
    addTransportationPoints,
    addDistrictBoundaries,
    toggleLayer,
    closePopup,
  } = useMap(elementReady ? mapContainerId : null);

  // Add destinations once map is loaded
  useEffect(() => {
    if (isLoaded && layerControl.destinations && destinations.length > 0) {
      console.log(`Adding ${destinations.length} destinations to map`);
      addDestinations(destinations);
    }
  }, [isLoaded, destinations, layerControl.destinations, addDestinations]);

  // Add transportation points once map is loaded
  useEffect(() => {
    if (
      isLoaded &&
      layerControl.transportation &&
      transportationPoints.length > 0
    ) {
      console.log(
        `Adding ${transportationPoints.length} transportation points to map`
      );
      addTransportationPoints(transportationPoints);
    }
  }, [
    isLoaded,
    transportationPoints,
    layerControl.transportation,
    addTransportationPoints,
  ]);

  // Add district boundaries once map is loaded
  useEffect(() => {
    if (isLoaded && layerControl.districts && districtGeoJSON) {
      console.log("Adding district boundaries to map");
      addDistrictBoundaries(districtGeoJSON);
    }
  }, [
    isLoaded,
    districtGeoJSON,
    layerControl.districts,
    addDistrictBoundaries,
  ]);

  // Display error if any
  if (error) {
    return (
      <div
        className={`${height} w-full bg-gray-100 rounded-lg flex items-center justify-center p-8 text-center`}
      >
        <div className="max-w-md">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Map Configuration Error
          </h3>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            Please check your environment variables and restart the development
            server.
          </p>
        </div>
      </div>
    );
  }

  // Display loading state
  if (!mapToken) {
    return (
      <div
        className={`${height} w-full bg-gray-100 rounded-lg flex items-center justify-center`}
      >
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-300 w-16 h-16 mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // Render the map and controls
  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div
        id={mapContainerId}
        className={`w-full ${height} rounded-lg overflow-hidden shadow-lg`}
        style={{ background: "#e5e7eb" }} // Light gray background while loading
      />

      {/* Layer controls */}
      {showLayerControl && isLoaded && (
        <div className="absolute top-4 right-4 z-10">
          <LayerControl
            layerControl={layerControl}
            onToggleLayer={toggleLayer}
          />
        </div>
      )}

      {/* Filter controls */}
      {showFilter && isLoaded && (
        <div className="absolute top-4 left-4 z-10 w-[280px]">
          <MapFilter />
        </div>
      )}

      {/* Popup */}
      {popupInfo && <MapPopup popupInfo={popupInfo} onClose={closePopup} />}
    </div>
  );
}
