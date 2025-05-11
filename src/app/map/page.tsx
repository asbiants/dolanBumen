"use client";

import { MapContainer } from "@/components/map/MapContainer";
import {
  DESTINATION_CATEGORIES,
  TRANSPORTATION_TYPES,
  Destination,
  TransportPoint,
} from "@/types/map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Compass, Navigation, Map as MapIcon } from "lucide-react";
import { useMap } from "@/hooks/useMap";

// Sample data for demonstration
const sampleDestinations: Destination[] = [
  {
    id: "1",
    name: "Pantai Petanahan",
    description: "Beautiful beach with white sand and clear water in Kebumen",
    address: "Petanahan, Kebumen, Central Java",
    latitude: -7.7007,
    longitude: 109.5155,
    categoryId: "beach",
    categoryName: "Beach",
    categoryColor: "#06b6d4",
    categoryIcon: "🏖️",
    status: "active",
    thumbnailUrl: "/images/pantai-petanahan.jpg",
  },
  {
    id: "2",
    name: "Goa Jatijajar",
    description:
      "Famous limestone cave with underground river and beautiful stalactites",
    address: "Jatijajar, Kebumen, Central Java",
    latitude: -7.7422,
    longitude: 109.7091,
    categoryId: "nature",
    categoryName: "Nature",
    categoryColor: "#22c55e",
    categoryIcon: "🌳",
    status: "active",
    thumbnailUrl: "/images/goa-jatijajar.jpg",
  },
  {
    id: "3",
    name: "Benteng Van Der Wijck",
    description: "Historical Dutch fortress from colonial era",
    address: "Gombong, Kebumen, Central Java",
    latitude: -7.6047,
    longitude: 109.5132,
    categoryId: "history",
    categoryName: "History",
    categoryColor: "#a16207",
    categoryIcon: "📜",
    status: "active",
    thumbnailUrl: "/images/benteng-van-der-wijck.jpg",
  },
  {
    id: "4",
    name: "Waduk Sempor",
    description:
      "Beautiful reservoir with surrounding hills and water activities",
    address: "Sempor, Kebumen, Central Java",
    latitude: -7.5553,
    longitude: 109.4906,
    categoryId: "nature",
    categoryName: "Nature",
    categoryColor: "#22c55e",
    categoryIcon: "🌳",
    status: "active",
    thumbnailUrl: "/images/waduk-sempor.jpg",
  },
];

const sampleTransportation: TransportPoint[] = [
  {
    id: "1",
    name: "Kebumen Train Station",
    address: "Jl. Stasiun, Kebumen, Central Java",
    latitude: -7.6678,
    longitude: 109.6587,
    transportationTypeId: "station",
    transportationTypeName: "Train Station",
    transportationTypeIcon: "🚆",
    transportationTypeColor: "#0060ff",
  },
  {
    id: "2",
    name: "Kebumen Bus Terminal",
    address: "Jl. Arungbinang, Kebumen, Central Java",
    latitude: -7.6694,
    longitude: 109.6523,
    transportationTypeId: "terminal",
    transportationTypeName: "Bus Terminal",
    transportationTypeIcon: "🚌",
    transportationTypeColor: "#10b981",
  },
];

// Sample GeoJSON for districts
const sampleDistrictGeoJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "1",
        name: "Kebumen",
        color: "#3b82f6",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [109.2, -7.5],
            [109.6, -7.5],
            [109.6, -7.8],
            [109.2, -7.8],
            [109.2, -7.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "2",
        name: "Gombong",
        color: "#10b981",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [109.47, -7.5],
            [109.65, -7.5],
            [109.65, -7.7],
            [109.47, -7.7],
            [109.47, -7.5],
          ],
        ],
      },
    },
  ],
};

export default function MapPage() {
  const mapContainerId = "map-container";
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [transportation, setTransportation] = useState<TransportPoint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyDestinations, setNearbyDestinations] = useState<
    Array<Destination & { distance: number }>
  >([]);
  const [showNearby, setShowNearby] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Don't use mapHook here - we'll let the MapContainer handle the map directly

  // Simulate data fetching
  useEffect(() => {
    // In a real app, this would be an API call
    console.log("Setting up sample destinations and transportation data");

    // Verify data format
    sampleDestinations.forEach((dest, index) => {
      console.log(
        `Destination ${index + 1}: ${dest.name}, coords: [${dest.longitude}, ${
          dest.latitude
        }], icon: ${dest.categoryIcon}`
      );
    });

    sampleTransportation.forEach((point, index) => {
      console.log(
        `Transportation ${index + 1}: ${point.name}, coords: [${
          point.longitude
        }, ${point.latitude}], icon: ${point.transportationTypeIcon}`
      );
    });

    setTimeout(() => {
      setDestinations(sampleDestinations);
      setTransportation(sampleTransportation);
      setIsLoaded(true);
      console.log("Data loaded and ready to be displayed on map");
    }, 1000);
  }, []);

  // Calculate distance between two coordinates in kilometers (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Find nearby destinations based on user's location
  const findNearbyDestinations = () => {
    if (!userLocation) {
      // Show loading state
      setIsLoadingLocation(true);

      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // Calculate distances and sort destinations
          const destinationsWithDistance = destinations
            .map((dest) => ({
              ...dest,
              distance: calculateDistance(
                latitude,
                longitude,
                dest.latitude,
                dest.longitude
              ),
            }))
            .sort((a, b) => a.distance - b.distance);

          setNearbyDestinations(destinationsWithDistance);
          setShowNearby(true);

          // We'll handle map updates differently - find the map instance through DOM
          const mapInstance = document.getElementById(mapContainerId);
          if (mapInstance) {
            // Map is rendered - we can reference it by ID for later use
            console.log("Map container found, ready for nearby features");
          }

          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to access your location. Please enable location services."
          );
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // We already have user location, just toggle display
      setShowNearby(!showNearby);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interactive Tourism Map</h1>
        <p className="text-gray-600">
          Explore Kebumen's tourist destinations, transportation options, and
          district boundaries on this interactive map.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <MapContainer
            destinations={destinations}
            transportationPoints={transportation}
            districtGeoJSON={sampleDistrictGeoJSON}
            height="h-[650px]"
            mapInstanceId={mapContainerId}
            showLayerControl={true}
            showFilter={true}
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <Button
              onClick={findNearbyDestinations}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  {showNearby ? "Hide Nearby Places" : "Find Nearby Places"}
                </>
              )}
            </Button>
          </div>

          {showNearby && nearbyDestinations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Nearby Destinations</CardTitle>
                <CardDescription>
                  Based on your current location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {nearbyDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
                        style={{
                          backgroundColor: dest.categoryColor || "#6366f1",
                        }}
                      >
                        {dest.categoryIcon || "📍"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{dest.name}</h4>
                        <p className="text-xs text-gray-500">
                          {dest.distance.toFixed(1)} km away •{" "}
                          {dest.categoryName}
                        </p>
                      </div>
                      <MapIcon className="h-4 w-4 text-indigo-600 mt-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Types of tourist destinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DESTINATION_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="mr-1">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transportation</CardTitle>
              <CardDescription>Transportation options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TRANSPORTATION_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="mr-1">{type.icon}</span>
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Map Tips</CardTitle>
              <CardDescription>How to use the map</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Click on markers to see details</p>
              <p>• Use the layer control to toggle visibility</p>
              <p>• Search for specific destinations</p>
              <p>• Filter by category or transportation type</p>
              <p>• Use navigation controls to zoom in/out</p>
              <p>• Find nearby attractions from your location</p>
              <p>• Click on a nearby destination to zoom to it</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
