import { LngLatBoundsLike, LngLatLike } from "mapbox-gl";

export interface MapConfig {
  style: string;
  center: LngLatLike;
  zoom: number;
  pitch?: number;
  bearing?: number;
  antialias?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  thumbnailUrl?: string;
  status: "active" | "inactive";
}

export interface TransportPoint {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  transportationTypeId: string;
  transportationTypeName?: string;
  transportationTypeIcon?: string;
  transportationTypeColor?: string;
}

export interface District {
  id: string;
  name: string;
  city?: string;
  province?: string;
  polygonCoordinates: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  centerLatitude?: number;
  centerLongitude?: number;
}

export interface MapFilter {
  destinationCategory?: string[];
  transportationType?: string[];
  district?: string;
  searchTerm?: string;
  bounds?: LngLatBoundsLike;
}

export interface LayerControl {
  destinations: boolean;
  transportation: boolean;
  districts: boolean;
}

export interface PopupInfo {
  type: "destination" | "transportation";
  data: Destination | TransportPoint;
  coordinates: [number, number];
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  style: "mapbox://styles/mapbox/light-v11",
  center: [109.3425, -7.6275], // Kebumen, Central Java
  zoom: 10,
  pitch: 45,
  bearing: -17.6,
  antialias: true,
};

export const DESTINATION_CATEGORIES = [
  { id: "nature", name: "Nature", color: "#22c55e", icon: "🌳" },
  { id: "culture", name: "Culture", color: "#8b5cf6", icon: "🏛️" },
  { id: "culinary", name: "Culinary", color: "#f97316", icon: "🍽️" },
  { id: "religious", name: "Religious", color: "#eab308", icon: "🕌" },
  { id: "history", name: "History", color: "#a16207", icon: "📜" },
  { id: "beach", name: "Beach", color: "#06b6d4", icon: "🏖️" },
  { id: "park", name: "Park", color: "#65a30d", icon: "🌲" },
  { id: "shopping", name: "Shopping", color: "#ec4899", icon: "🛍️" },
  { id: "entertainment", name: "Entertainment", color: "#8b5cf6", icon: "🎭" },
];

export const TRANSPORTATION_TYPES = [
  { id: "station", name: "Train Station", color: "#0060ff", icon: "🚆" },
  { id: "terminal", name: "Bus Terminal", color: "#10b981", icon: "🚌" },
  { id: "airport", name: "Airport", color: "#f43f5e", icon: "✈️" },
  { id: "port", name: "Harbor/Port", color: "#3b82f6", icon: "⚓" },
  { id: "brt", name: "BRT Stop", color: "#f59e0b", icon: "🚏" },
];
