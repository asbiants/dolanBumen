import { useState, useRef, useEffect, useCallback } from "react";
import mapboxgl, { Map, Marker, Popup } from "mapbox-gl";
import {
  DEFAULT_MAP_CONFIG,
  Destination,
  LayerControl,
  MapConfig,
  MapFilter,
  PopupInfo,
  TransportPoint,
} from "@/types/map";

export const useMap = (
  elementId: string | null,
  initialConfig: Partial<MapConfig> = {}
) => {
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<{ [id: string]: Marker }>({});
  const userLocationMarkerRef = useRef<Marker | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [layerControl, setLayerControl] = useState<LayerControl>({
    destinations: true,
    transportation: true,
    districts: false,
  });
  const [filter, setFilter] = useState<MapFilter>({});
  const [initializeAttempts, setInitializeAttempts] = useState(0);

  // Initialize map
  useEffect(() => {
    // Check if we already have a map instance or if elementId is null
    if (mapRef.current || !elementId || typeof window === "undefined") {
      return;
    }

    // Ensure DOM is ready and element exists
    const initMap = () => {
      // Check if the DOM element exists
      const container = document.getElementById(elementId);
      if (!container) {
        console.error(
          `Map container element with ID '${elementId}' not found.`
        );

        // Try again if we haven't exceeded max attempts
        if (initializeAttempts < 5) {
          setInitializeAttempts((prev) => prev + 1);
          setTimeout(initMap, 500); // Try again in 500ms
        }

        return;
      }

      console.log("Found map container, initializing map...");

      // Get access token from environment
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!accessToken) {
        console.error(
          "Mapbox access token not found. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables."
        );
        return;
      }

      // Set access token
      mapboxgl.accessToken = accessToken;

      const config = { ...DEFAULT_MAP_CONFIG, ...initialConfig };

      try {
        // Use a default Mapbox style if none specified
        const mapStyle = config.style || "mapbox://styles/mapbox/streets-v12";

        const map = new mapboxgl.Map({
          container: elementId,
          style: mapStyle,
          center: config.center,
          zoom: config.zoom || 9,
          pitch: config.pitch || 0,
          bearing: config.bearing || 0,
          antialias: config.antialias || true,
        });

        map.on("load", () => {
          console.log("Map loaded successfully");

          // Add standard navigation controls
          map.addControl(new mapboxgl.NavigationControl(), "top-right");

          // Add geolocation control (this adds a button to center on user's location)
          const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
          });

          map.addControl(geolocateControl, "top-right");

          // Automatically trigger geolocation when map loads (this will show the user's location)
          map.once("idle", () => {
            // Short delay to ensure map is fully rendered
            setTimeout(() => {
              console.log("Triggering geolocation to show user's location");
              geolocateControl.trigger();
            }, 1000);
          });

          setIsLoaded(true);
        });

        map.on("error", (e) => {
          console.error("Mapbox error:", e);
        });

        // Listen for custom flyToDestination event
        const handleFlyToDestination = (e: Event) => {
          const customEvent = e as CustomEvent;
          if (
            customEvent.detail &&
            customEvent.detail.longitude &&
            customEvent.detail.latitude
          ) {
            console.log(
              `Flying to: ${customEvent.detail.name || "destination"}`
            );
            map.flyTo({
              center: [
                customEvent.detail.longitude,
                customEvent.detail.latitude,
              ],
              zoom: 15,
              essential: true,
            });

            // Optionally create a temporary highlight marker
            const el = document.createElement("div");
            el.className = "highlight-marker";
            el.style.width = "40px";
            el.style.height = "40px";
            el.style.borderRadius = "50%";
            el.style.border = "3px solid white";
            el.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
            el.style.backgroundColor = "rgba(66, 135, 245, 0.6)";
            el.style.animation = "pulse 1.5s infinite";

            // Add a style for the pulse animation if it doesn't exist
            if (!document.getElementById("marker-pulse-animation")) {
              const style = document.createElement("style");
              style.id = "marker-pulse-animation";
              style.textContent = `
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.3); opacity: 0.7; }
                  100% { transform: scale(1); opacity: 1; }
                }
              `;
              document.head.appendChild(style);
            }

            const highlightMarker = new mapboxgl.Marker(el)
              .setLngLat([
                customEvent.detail.longitude,
                customEvent.detail.latitude,
              ])
              .addTo(map);

            // Remove the highlight marker after a few seconds
            setTimeout(() => {
              highlightMarker.remove();
            }, 3000);
          }
        };

        document.addEventListener("flyToDestination", handleFlyToDestination);

        mapRef.current = map;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Slight delay to ensure DOM is ready
    setTimeout(initMap, 100);

    return () => {
      // Clean up event listeners
      document.removeEventListener("flyToDestination", (e: Event) => {
        console.log("Cleaning up flyToDestination event listener");
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [elementId, initialConfig, initializeAttempts]);

  // Add destinations to map
  const addDestinations = useCallback(
    (destinations: Destination[]) => {
      if (!mapRef.current || !isLoaded) {
        console.warn("Map not loaded yet, can't add destinations");
        return;
      }

      console.log(`Adding ${destinations.length} destination markers to map`);

      // Clear existing destination markers
      Object.keys(markersRef.current).forEach((id) => {
        if (id.startsWith("destination-")) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add new destination markers
      destinations.forEach((destination) => {
        if (!destination.latitude || !destination.longitude) {
          console.warn(
            `Destination ${destination.id} missing coordinates, skipping`
          );
          return;
        }

        try {
          console.log(
            `Creating marker for ${destination.name} at [${destination.longitude}, ${destination.latitude}]`
          );

          // Create a HTML element for the marker
          const el = document.createElement("div");
          el.className = "destination-marker";
          el.style.backgroundColor = destination.categoryColor || "#6366f1";
          el.style.color = "white";
          el.style.width = "35px";
          el.style.height = "35px";
          el.style.borderRadius = "50%";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.cursor = "pointer";
          el.style.fontSize = "18px";
          el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          el.innerHTML = destination.categoryIcon || "📍";

          // Create the popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: sans-serif; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">${
                  destination.name
                }</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${
                  destination.description || ""
                }</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;"><strong>Category:</strong> ${
                  destination.categoryName || "N/A"
                }</p>
              </div>
            `);

          // Create the marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat([destination.longitude, destination.latitude])
            .setPopup(popup)
            .addTo(mapRef.current!);

          // Add click event
          el.addEventListener("click", () => {
            console.log(`Marker clicked: ${destination.name}`);
            setPopupInfo({
              type: "destination",
              data: destination,
              coordinates: [destination.longitude, destination.latitude],
            });
          });

          // Store reference
          markersRef.current[`destination-${destination.id}`] = marker;
        } catch (error) {
          console.error(
            `Error creating marker for ${destination.name}:`,
            error
          );
        }
      });
    },
    [isLoaded]
  );

  // Add transportation points to map
  const addTransportationPoints = useCallback(
    (transportPoints: TransportPoint[]) => {
      if (!mapRef.current || !isLoaded) {
        console.warn("Map not loaded yet, can't add transportation points");
        return;
      }

      console.log(
        `Adding ${transportPoints.length} transportation markers to map`
      );

      // Clear existing transport markers
      Object.keys(markersRef.current).forEach((id) => {
        if (id.startsWith("transport-")) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add new transport markers
      transportPoints.forEach((point) => {
        if (!point.latitude || !point.longitude) {
          console.warn(
            `Transport point ${point.id} missing coordinates, skipping`
          );
          return;
        }

        try {
          console.log(
            `Creating marker for ${point.name} at [${point.longitude}, ${point.latitude}]`
          );

          // Create a HTML element for the marker
          const el = document.createElement("div");
          el.className = "transport-marker";
          el.style.backgroundColor = point.transportationTypeColor || "#3b82f6";
          el.style.color = "white";
          el.style.width = "35px";
          el.style.height = "35px";
          el.style.borderRadius = "50%";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.cursor = "pointer";
          el.style.fontSize = "18px";
          el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          el.innerHTML = point.transportationTypeIcon || "🚏";

          // Create the popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: sans-serif; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">${
                  point.name
                }</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${
                  point.address || ""
                }</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;"><strong>Type:</strong> ${
                  point.transportationTypeName || "N/A"
                }</p>
              </div>
            `);

          // Create the marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .setPopup(popup)
            .addTo(mapRef.current!);

          // Add click event
          el.addEventListener("click", () => {
            console.log(`Marker clicked: ${point.name}`);
            setPopupInfo({
              type: "transportation",
              data: point,
              coordinates: [point.longitude, point.latitude],
            });
          });

          // Store reference
          markersRef.current[`transport-${point.id}`] = marker;
        } catch (error) {
          console.error(`Error creating marker for ${point.name}:`, error);
        }
      });
    },
    [isLoaded]
  );

  // Fly to location - MOVED UP before it's used in showUserLocation
  const flyTo = useCallback((lng: number, lat: number, zoom: number = 15) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom,
      essential: true,
    });
  }, []);

  // Add user's current location to the map with a custom marker
  const showUserLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (!mapRef.current || !isLoaded) return;

      // Remove existing user location marker if any
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }

      console.log(`Showing user location at [${longitude}, ${latitude}]`);

      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = "relative";

      // Inner circle (blue dot)
      const innerCircle = document.createElement("div");
      innerCircle.className =
        "w-6 h-6 rounded-full bg-blue-500 border-2 border-white animate-pulse flex items-center justify-center";
      innerCircle.style.backgroundColor = "#4287f5"; // Blue color
      innerCircle.style.color = "white";
      innerCircle.style.width = "20px";
      innerCircle.style.height = "20px";
      innerCircle.style.borderRadius = "50%";
      innerCircle.style.display = "flex";
      innerCircle.style.alignItems = "center";
      innerCircle.style.justifyContent = "center";
      innerCircle.style.border = "2px solid white";
      innerCircle.style.boxShadow = "0 0 0 2px rgba(66, 135, 245, 0.5)";
      innerCircle.innerHTML = "🧍"; // Person icon

      // Outer circle (pulse effect)
      const outerCircle = document.createElement("div");
      outerCircle.style.position = "absolute";
      outerCircle.style.top = "-8px";
      outerCircle.style.left = "-8px";
      outerCircle.style.width = "36px";
      outerCircle.style.height = "36px";
      outerCircle.style.borderRadius = "50%";
      outerCircle.style.backgroundColor = "rgba(66, 135, 245, 0.4)";
      outerCircle.style.animation =
        "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite";

      // Add a style for the ping animation if it doesn't exist
      if (!document.getElementById("user-marker-animation")) {
        const style = document.createElement("style");
        style.id = "user-marker-animation";
        style.textContent = `
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      markerElement.appendChild(outerCircle);
      markerElement.appendChild(innerCircle);

      // Add marker to map
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current!);

      // Add a popup to the marker
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        "<strong>Your Location</strong><p>You are here!</p>"
      );

      marker.setPopup(popup);

      // Save reference to marker
      userLocationMarkerRef.current = marker;

      // Fly to user location
      flyTo(longitude, latitude);
    },
    [isLoaded, flyTo]
  );

  // Focus on nearby destinations
  const focusNearbyDestinations = useCallback(
    (userLat: number, userLng: number, destinations: Destination[]) => {
      if (!mapRef.current || !isLoaded) return;

      // Add user location marker
      showUserLocation(userLat, userLng);

      // Calculate bounds to include user location and all destinations
      if (destinations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        // Add user location to bounds
        bounds.extend([userLng, userLat]);

        // Add all destinations to bounds
        destinations.forEach((dest) => {
          if (dest.latitude && dest.longitude) {
            bounds.extend([dest.longitude, dest.latitude]);
          }
        });

        // Fit map to these bounds with padding
        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        });
      }
    },
    [isLoaded, showUserLocation]
  );

  // Add district boundaries
  const addDistrictBoundaries = useCallback(
    (geojson: GeoJSON.FeatureCollection) => {
      if (!mapRef.current || !isLoaded) return;

      const map = mapRef.current;

      // Remove existing district layers
      if (map.getLayer("district-fills")) {
        map.removeLayer("district-fills");
      }
      if (map.getLayer("district-borders")) {
        map.removeLayer("district-borders");
      }
      if (map.getSource("districts")) {
        map.removeSource("districts");
      }

      // Add new district source and layers
      map.addSource("districts", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "district-fills",
        type: "fill",
        source: "districts",
        layout: {},
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.1,
        },
      });

      map.addLayer({
        id: "district-borders",
        type: "line",
        source: "districts",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });

      // Add click event for district
      map.on("click", "district-fills", (e) => {
        if (e.features && e.features[0].properties) {
          const properties = e.features[0].properties;
          // Handle district click as needed
          console.log("District clicked:", properties);
        }
      });

      // Change cursor on hover
      map.on("mouseenter", "district-fills", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "district-fills", () => {
        map.getCanvas().style.cursor = "";
      });
    },
    [isLoaded]
  );

  // Toggle layer visibility
  const toggleLayer = useCallback((layer: keyof LayerControl) => {
    setLayerControl((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<MapFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
    }));
  }, []);

  // Close popup
  const closePopup = useCallback(() => {
    setPopupInfo(null);
  }, []);

  // Reset map view
  const resetView = useCallback(() => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: DEFAULT_MAP_CONFIG.center,
      zoom: DEFAULT_MAP_CONFIG.zoom,
      pitch: DEFAULT_MAP_CONFIG.pitch,
      bearing: DEFAULT_MAP_CONFIG.bearing,
    });
  }, []);

  return {
    map: mapRef.current,
    isLoaded,
    layerControl,
    popupInfo,
    filter,
    addDestinations,
    addTransportationPoints,
    addDistrictBoundaries,
    showUserLocation,
    focusNearbyDestinations,
    toggleLayer,
    updateFilter,
    closePopup,
    flyTo,
    resetView,
  };
};
