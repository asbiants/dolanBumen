"use client";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/navbar/navbar";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const Map = dynamic(() => import("react-map-gl"), { ssr: false });
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMapMarkerAlt, FaPlus, FaMinus, FaCrosshairs, FaLayerGroup, FaLocationArrow } from "react-icons/fa";
// @ts-ignore
import Supercluster from "supercluster";

const Marker = dynamic(() => import("react-map-gl").then(mod => mod.Marker), { ssr: false });
const Source = dynamic(() => import("react-map-gl").then(mod => mod.Source), { ssr: false });
const Layer = dynamic(() => import("react-map-gl").then(mod => mod.Layer), { ssr: false });
const Popup = dynamic(() => import("react-map-gl").then(mod => mod.Popup), { ssr: false });

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface TouristDestination {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: Category;
  thumbnailUrl?: string;
}

const fetchDestinations = async (): Promise<TouristDestination[]> => {
  const res = await fetch("/api/admin/tourist-destinations");
  if (!res.ok) throw new Error("Failed to fetch destinations");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
};

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/admin/destination-categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

export default function TourismMapPage() {
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState({
    latitude: -7.6778,
    longitude: 109.6536,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  });
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v11");
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
  const [routeStart, setRouteStart] = useState<{ lat: number, lng: number } | null>(null);
  const [routeDest, setRouteDest] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const startLatRef = useRef<HTMLInputElement>(null);
  const startLngRef = useRef<HTMLInputElement>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<TouristDestination | null>(null);
  const [nearbyMenuOpen, setNearbyMenuOpen] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyList, setNearbyList] = useState<TouristDestination[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const focusId = searchParams ? searchParams.get('focus') : null;
  const [selectedGeoJSONLayers, setSelectedGeoJSONLayers] = useState<string[]>([]);
  const [geoJSONMenuOpen, setGeoJSONMenuOpen] = useState(false);
  const [administrativeGeoJSON, setAdministrativeGeoJSON] = useState<any>(null);
  const [kecamatanGeoJSON, setKecamatanGeoJSON] = useState<any>(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState<any>(null);
  const [kecamatanPopup, setKecamatanPopup] = useState<{ longitude: number; latitude: number } | null>(null);
  const [useNearbyCurrentLocation, setUseNearbyCurrentLocation] = useState(true);
  const [nearbyManualLat, setNearbyManualLat] = useState('');
  const [nearbyManualLng, setNearbyManualLng] = useState('');
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [clusters, setClusters] = useState<any[]>([]);
  const [superclusterInstance, setSuperclusterInstance] = useState<any>(null);
  const [jaringanJalanGeoJSON, setJaringanJalanGeoJSON] = useState<any>(null);
  const [jaringanKeretaGeoJSON, setJaringanKeretaGeoJSON] = useState<any>(null);

  // Auto-center & open popup jika ada focusId
  useEffect(() => {
    if (focusId && destinations.length > 0) {
      const dest = destinations.find(d => d.id === focusId);
      if (dest) {
        setSelectedDestination(dest);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [dest.longitude, dest.latitude], zoom: 15 });
        }
      }
    }
    // eslint-disable-next-line
  }, [focusId, destinations]);

  // Ref untuk Map
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([fetchDestinations(), fetchCategories()])
      .then(([dest, cats]) => {
        if (isMounted) {
          setDestinations(dest);
          setCategories(cats);
        }
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    // Load GeoJSON batas administrasi, jalan, dan kereta
    Promise.all([
      fetch('/GeoJSON/batas_kabupaten.geojson').then(res => res.json()),
      fetch('/GeoJSON/batas_kecamatan.geojson').then(res => res.json()),
      fetch('/GeoJSON/jaringan_jalan_kebumen.geojson').then(res => res.json()),
      fetch('/GeoJSON/jaringan_kereta.geojson').then(res => res.json()),
    ]).then(([kabupatenData, kecamatanData, jalanData, keretaData]) => {
      setAdministrativeGeoJSON(kabupatenData);
      setKecamatanGeoJSON(kecamatanData);
      setJaringanJalanGeoJSON(jalanData);
      setJaringanKeretaGeoJSON(keretaData);
      console.log('Loaded Kabupaten:', kabupatenData);
      console.log('Loaded Kecamatan:', kecamatanData);
      if (!kabupatenData || kabupatenData.type !== 'FeatureCollection' || !Array.isArray(kabupatenData.features)) {
        console.error('GeoJSON Kabupaten tidak valid:', kabupatenData);
      }
      if (!kecamatanData || kecamatanData.type !== 'FeatureCollection' || !Array.isArray(kecamatanData.features)) {
        console.error('GeoJSON Kecamatan tidak valid:', kecamatanData);
      }
      if (!jalanData || jalanData.type !== 'FeatureCollection' || !Array.isArray(jalanData.features)) {
        console.error('GeoJSON Jaringan Jalan tidak valid:', jalanData);
      }
      if (!keretaData || keretaData.type !== 'FeatureCollection' || !Array.isArray(keretaData.features)) {
        console.error('GeoJSON Jaringan Kereta tidak valid:', keretaData);
      }
    }).catch(error => {
      console.error('Error loading GeoJSON:', error);
    });
  }, []);

  const filteredDestinations = selectedCategory
    ? destinations.filter((d) => d.category?.id === selectedCategory)
    : destinations;

  // Buat map kategoriId ke kategori (untuk legenda)
  const categoryMap: Record<string, Category> = {};
  categories.forEach(cat => { categoryMap[cat.id] = cat; });

  // Helper: get current location
  const getCurrentLocation = async () => {
    return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation tidak didukung browser Anda");
        alert("Geolocation tidak didukung browser Anda");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setViewport(v => ({ ...v, latitude: loc.lat, longitude: loc.lng, zoom: 15 }));
          resolve(loc);
        },
        err => {
          let msg = "Gagal mendapatkan lokasi Anda";
          if (err.code === 1) msg = "Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.";
          else if (err.code === 2) msg = "Lokasi tidak tersedia.";
          else if (err.code === 3) msg = "Timeout saat mengambil lokasi.";
          alert(msg);
          reject(msg);
        }
      );
    });
  };

  // Helper: haversine distance (km)
  function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Handler nearby
  const handleShowNearby = async (radius: number) => {
    setNearbyLoading(true);
    let loc = userLocation;

    if (useNearbyCurrentLocation) {
      if (!loc) {
        try {
          const pos = await getCurrentLocation();
          loc = pos;
        } catch {
          alert("Gagal mendapatkan lokasi Anda");
          setNearbyLoading(false);
          return;
        }
      }
    } else {
      // Pakai input manual
      const lat = parseFloat(nearbyManualLat);
      const lng = parseFloat(nearbyManualLng);
      if (isNaN(lat) || isNaN(lng)) {
        alert("Masukkan latitude dan longitude yang valid");
        setNearbyLoading(false);
        return;
      }
      loc = { lat, lng };
      setUserLocation(loc); // opsional: update marker user
    }

    if (!loc) {
      setNearbyLoading(false);
      return;
    }
    const filtered = destinations.filter(d => getDistanceKm(loc!.lat, loc!.lng, d.latitude, d.longitude) <= radius);
    setNearbyList(filtered);
    setNearbyLoading(false);
  };

  // Handler tampilkan rute
  const handleShowRoute = async () => {
    setRouteLoading(true);
    let start: { lat: number, lng: number } | null = null;
    if (useCurrentLocation) {
      try {
        start = await getCurrentLocation();
      } catch {
        alert("Gagal mendapatkan lokasi Anda");
        setRouteLoading(false);
        return;
      }
    } else if (routeStart) {
      start = routeStart;
    } else {
      alert("Isi titik awal terlebih dahulu");
      setRouteLoading(false);
      return;
    }
    const destObj = destinations.find(d => d.id === routeDest);
    if (!destObj) {
      alert("Pilih destinasi terlebih dahulu");
      setRouteLoading(false);
      return;
    }
    const startLng = start.lng;
    const startLat = start.lat;
    const endLng = destObj.longitude;
    const endLat = destObj.latitude;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        setRouteGeoJSON({
          type: "Feature",
          geometry: data.routes[0].geometry
        });
        setRouteInfo({
          distance: data.routes[0].distance,
          duration: data.routes[0].duration
        });
      } else {
        setRouteGeoJSON(null);
        setRouteInfo(null);
        alert("Rute tidak ditemukan");
      }
    } catch (e) {
      setRouteGeoJSON(null);
      setRouteInfo(null);
      alert("Gagal mengambil rute");
    }
    setRouteLoading(false);
  };

  const toggleGeoJSONLayer = (layer: string) => {
    setSelectedGeoJSONLayers((prev) =>
      prev.includes(layer)
        ? prev.filter((l) => l !== layer)
        : [...prev, layer]
    );
  };

  // Helper: convert destinations to GeoJSON features
  const destinationsToGeoJSON = (destList: TouristDestination[]) => ({
    type: "FeatureCollection" as const,
    features: destList.map((d) => ({
      type: "Feature" as const,
      properties: {
        id: d.id,
        categoryId: d.category?.id,
        categoryIcon: d.category?.icon,
        categoryName: d.category?.name,
        name: d.name,
        address: d.address,
        thumbnailUrl: d.thumbnailUrl || null,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [d.longitude, d.latitude] as [number, number],
      },
    })),
  });

  // --- CLUSTER UPDATE OPTIMALISASI ---
  const getMapBounds = () => {
    if (mapRef.current && mapRef.current.getMap) {
      const b = mapRef.current.getMap().getBounds();
      if (b && b.toArray) return b.toArray().flat();
    }
    // fallback: area Banyumas
    return [109.3, -7.9, 110, -7.4];
  };

  const updateClusters = React.useCallback(() => {
    if (!clusterEnabled) return;
    const geojson = destinationsToGeoJSON(nearbyMenuOpen ? nearbyList : filteredDestinations);
    const supercluster = new Supercluster({
      radius: 60,
      maxZoom: 18,
      map: (props: any) => ({
        categoryId: props.categoryId,
        categoryIcon: props.categoryIcon,
        categoryName: props.categoryName,
      }),
      reduce: (accumulated: any, props: any) => {
        if (!accumulated.categoryCount) accumulated.categoryCount = {};
        if (props.categoryId) {
          accumulated.categoryCount[props.categoryId] = (accumulated.categoryCount[props.categoryId] || 0) + 1;
          if (!accumulated.categoryIconMap) accumulated.categoryIconMap = {};
          accumulated.categoryIconMap[props.categoryId] = props.categoryIcon;
        }
      },
    });
    supercluster.load(geojson.features as import('supercluster').PointFeature<any>[]);
    setSuperclusterInstance(supercluster);
    const clusters = supercluster.getClusters(getMapBounds(), Math.round(viewport.zoom));
    setClusters(clusters);
  }, [clusterEnabled, filteredDestinations, nearbyList, viewport.zoom, nearbyMenuOpen]);

  // Trigger update cluster saat viewport, data, atau mapRef siap
  useEffect(() => {
    updateClusters();
  }, [updateClusters]);

  // --- onLoad Map trigger cluster update ---
  const handleMapLoad = React.useCallback(() => {
    updateClusters();
  }, [updateClusters]);

  // Komponen marker individual dan cluster dengan React.memo
  const MemoMarker = React.memo(Marker);
  const MemoPopup = React.memo(Popup);

  return (
    <div className="relative w-full min-h-screen">
      {/* Navbar absolute di atas map */}
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar />
      </div>
      {/* Legenda kategori kiri bawah & tombol rute/nearby kiri bawah */}
      <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-2">
        <div className="flex flex-col gap-2 mb-2">
          <button
            className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-2xl text-black border-2 border-gray-200 hover:bg-yellow-100 transition"
            onClick={() => setLegendOpen(v => !v)}
            aria-label={legendOpen ? "Tutup Legenda Kategori" : "Buka Legenda Kategori"}
          >
            <span className="font-bold text-lg">{legendOpen ? "×" : "i"}</span>
          </button>
          <button
            className="w-14 h-14 rounded-full bg-blue-500 shadow-lg flex items-center justify-center text-2xl text-white border-2 border-blue-200 hover:bg-blue-600 transition"
            onClick={() => setRouteMenuOpen(v => !v)}
            aria-label={routeMenuOpen ? "Tutup Menu Rute" : "Buka Menu Rute"}
          >
            <span className="font-bold text-lg">⇄</span>
          </button>
          <button
            className="w-14 h-14 rounded-full bg-green-500 shadow-lg flex items-center justify-center text-2xl text-white border-2 border-green-200 hover:bg-green-600 transition"
            onClick={() => setNearbyMenuOpen(v => !v)}
            aria-label={nearbyMenuOpen ? "Tutup Menu Nearby" : "Buka Menu Nearby"}
          >
            <FaLocationArrow />
          </button>
        </div>
        {legendOpen && (
          <div className="bg-white/95 rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col gap-2 min-w-[180px] animate-fade-in-up mb-2">
            <div className="font-bold mb-2 text-sm text-gray-700">Legenda Kategori</div>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 mb-1">
                {cat.icon ? (
                  <img src={cat.icon} alt={cat.name} className="w-6 h-6 rounded-full border border-gray-300 bg-white object-cover" loading="lazy" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center border border-gray-300">
                    <FaMapMarkerAlt className="text-black text-lg" />
                  </div>
                )}
                <span className="text-xs text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu rute kiri atas */}
      {routeMenuOpen && (
        <div className="absolute z-40 bg-white/95 rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col gap-3 animate-fade-in-up w-full max-w-xs left-1/2 -translate-x-1/2 top-[120px] sm:left-6 sm:top-28 sm:max-w-md sm:translate-x-0">
          <button
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xl text-gray-700 hover:bg-gray-200 hover:text-black transition z-10 shadow"
            aria-label="Tutup Menu Rute"
            onClick={() => setRouteMenuOpen(false)}
          >
            ×
          </button>
          <div className="font-bold mb-2 text-sm text-gray-700">Rute Wisata</div>
          <label className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={useCurrentLocation} onChange={e => setUseCurrentLocation(e.target.checked)} />
            <span className="text-xs">Gunakan lokasi saya</span>
          </label>
          {!useCurrentLocation && (
            <div className="flex gap-2 mb-2">
              <input ref={startLatRef} type="number" step="any" placeholder="Lat awal" className="border rounded px-2 py-1 w-24 text-xs" />
              <input ref={startLngRef} type="number" step="any" placeholder="Lng awal" className="border rounded px-2 py-1 w-24 text-xs" />
              <button type="button" className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => {
                setRouteStart({
                  lat: parseFloat(startLatRef.current?.value || "0"),
                  lng: parseFloat(startLngRef.current?.value || "0"),
                });
              }}>Set Awal</button>
            </div>
          )}
          <select
            className="border rounded px-2 py-1 text-xs mb-2"
            value={routeDest || ''}
            onChange={e => setRouteDest(e.target.value)}
          >
            <option value="">Pilih Destinasi</option>
            {destinations.map(dest => (
              <option key={dest.id} value={dest.id}>{dest.name}</option>
            ))}
          </select>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2 disabled:opacity-60" type="button" onClick={handleShowRoute} disabled={routeLoading}>
            {routeLoading ? <span className="animate-spin">⏳</span> : <span> Tampilkan Rute</span>}
          </button>
        </div>
      )}

      {/* Menu nearby kiri atas */}
      {nearbyMenuOpen && (
        <div className="absolute z-40 bg-white/95 rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col gap-3 animate-fade-in-up w-full max-w-xs left-1/2 -translate-x-1/2 top-[120px] sm:left-6 sm:top-28 sm:max-w-md sm:translate-x-0">
          <button
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xl text-gray-700 hover:bg-gray-200 hover:text-black transition z-10 shadow"
            aria-label="Tutup Menu Nearby"
            onClick={() => setNearbyMenuOpen(false)}
          >
            ×
          </button>
          <div className="font-bold mb-2 text-sm text-gray-700">Nearby Wisata</div>
          <div className="flex gap-2 mb-2">
            {[5,10,15,20].map(r => (
              <button
                key={r}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${nearbyRadius===r ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-100'}`}
                onClick={() => { setNearbyRadius(r); handleShowNearby(r); }}
              >
                {r} km
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={useNearbyCurrentLocation}
              onChange={e => setUseNearbyCurrentLocation(e.target.checked)}
            />
            <span className="text-xs">Gunakan lokasi saya</span>
          </label>
          {!useNearbyCurrentLocation && (
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                step="any"
                placeholder="Lat"
                className="border rounded px-2 py-1 w-24 text-xs"
                value={nearbyManualLat}
                onChange={e => setNearbyManualLat(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Lng"
                className="border rounded px-2 py-1 w-24 text-xs"
                value={nearbyManualLng}
                onChange={e => setNearbyManualLng(e.target.value)}
              />
            </div>
          )}
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2 disabled:opacity-60 mb-2"
            type="button"
            onClick={() => handleShowNearby(nearbyRadius)}
            disabled={nearbyLoading}
          >
            {nearbyLoading ? <span className="animate-spin">⏳</span> : <span>Cari Terdekat</span>}
          </button>
          {userLocation && (
            <div className="text-xs text-gray-500 mb-2">Lokasi Anda: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {nearbyList.length === 0 && !nearbyLoading && <div className="text-xs text-gray-400">Tidak ada destinasi dalam radius ini.</div>}
            {nearbyList.map(dest => (
              <div key={dest.id} className="flex items-center gap-2 p-2 rounded hover:bg-green-50 cursor-pointer" onClick={() => {
                setSelectedDestination(dest);
                setViewport(v => ({ ...v, latitude: dest.latitude, longitude: dest.longitude, zoom: 15 }));
                setNearbyMenuOpen(false);
              }}>
                <FaMapMarkerAlt className="text-green-600 text-lg" />
                <div>
                  <div className="font-bold text-xs text-green-900">{dest.name}</div>
                  <div className="text-[10px] text-gray-500">{dest.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map benar-benar 100vh, responsif */}
      <div className="w-full h-screen relative pt-16">
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading Map...</div>}>
          <Map
            ref={mapRef}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
              latitude: -7.6778,
              longitude: 109.6536,
              zoom: 10,
              bearing: 0,
              pitch: 0,
              padding: {top:0, bottom:0, left:0, right:0}
            }}
            style={{ width: "100vw", height: "100vh" }}
            mapStyle={mapStyle}
            onMoveEnd={e => setViewport(v => ({
              ...v,
              latitude: e.viewState.latitude,
              longitude: e.viewState.longitude,
              zoom: e.viewState.zoom,
              bearing: e.viewState.bearing,
              pitch: e.viewState.pitch
            }))}
            onLoad={handleMapLoad}
            onClick={(e) => {
              if (
                kecamatanGeoJSON &&
                mapRef.current &&
                selectedGeoJSONLayers.includes('kecamatan')
              ) {
                try {
                  if (mapRef.current.getLayer && mapRef.current.getLayer('batas-kecamatan-fill')) {
                    const features = mapRef.current.queryRenderedFeatures(e.point, {
                      layers: ['batas-kecamatan-fill']
                    });
                    if (features && features.length > 0) {
                      const feature = features[0];
                      setSelectedKecamatan(feature.properties);
                      setKecamatanPopup({
                        longitude: e.lngLat.lng,
                        latitude: e.lngLat.lat
                      });
                    } else {
                      setKecamatanPopup(null);
                      setSelectedKecamatan(null);
                    }
                  } else {
                    setKecamatanPopup(null);
                    setSelectedKecamatan(null);
                  }
                } catch (err) {
                  // abaikan error
                }
              } else {
                setKecamatanPopup(null);
                setSelectedKecamatan(null);
              }
            }}
            onMouseMove={(e) => {
              if (
                kecamatanGeoJSON &&
                mapRef.current &&
                selectedGeoJSONLayers.includes('kecamatan')
              ) {
                try {
                  if (mapRef.current.getLayer && mapRef.current.getLayer('batas-kecamatan-fill')) {
                    const features = mapRef.current.queryRenderedFeatures(e.point, {
                      layers: ['batas-kecamatan-fill']
                    });
                    if (features && features.length > 0) {
                      mapRef.current.getCanvas().style.cursor = 'pointer';
                    } else {
                      mapRef.current.getCanvas().style.cursor = '';
                    }
                  } else {
                    mapRef.current.getCanvas().style.cursor = '';
                  }
                } catch (err) {
                  mapRef.current.getCanvas().style.cursor = '';
                }
              } else if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
              }
            }}
          >
            {/* Polyline rute dengan desain lebih menarik */}
            {routeGeoJSON && (
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#0074D9",
                    "line-width": 6,
                    "line-opacity": 0.95
                  }}
                />
              </Source>
            )}
            {/* Layer Garis (Jalan & Kereta) */}
            {selectedGeoJSONLayers.includes('jalan')
              && jaringanJalanGeoJSON
              && jaringanJalanGeoJSON.type === 'FeatureCollection'
              && Array.isArray(jaringanJalanGeoJSON.features)
              && jaringanJalanGeoJSON.features.length > 0 && (
              <Source id="jaringan-jalan" type="geojson" data={jaringanJalanGeoJSON}>
                <Layer
                  id="jaringan-jalan-line"
                  type="line"
                  paint={{
                    "line-color": "#FF9900",
                    "line-width": 2.5,
                    "line-opacity": 0.85
                  }}
                  filter={["==", "$type", "LineString"]}
                />
              </Source>
            )}
            {selectedGeoJSONLayers.includes('kereta')
              && jaringanKeretaGeoJSON
              && jaringanKeretaGeoJSON.type === 'FeatureCollection'
              && Array.isArray(jaringanKeretaGeoJSON.features)
              && jaringanKeretaGeoJSON.features.length > 0 && (
              <Source id="jaringan-kereta" type="geojson" data={jaringanKeretaGeoJSON}>
                <Layer
                  id="jaringan-kereta-line"
                  type="line"
                  paint={{
                    "line-color": "#222",
                    "line-width": 2.5,
                    "line-opacity": 0.85
                  }}
                  filter={["==", "$type", "LineString"]}
                />
              </Source>
            )}
            {/* Layer Polygon (Batas Kabupaten & Kecamatan) */}
            {selectedGeoJSONLayers.includes('kabupaten')
              && administrativeGeoJSON
              && administrativeGeoJSON.type === 'FeatureCollection'
              && Array.isArray(administrativeGeoJSON.features)
              && administrativeGeoJSON.features.length > 0 && (
              <Source id="batas-kabupaten" type="geojson" data={administrativeGeoJSON}>
                <Layer
                  id="batas-kabupaten-fill"
                  type="fill"
                  paint={{
                    "fill-color": "#FF0000",
                    "fill-opacity": 0.1
                  }}
                  filter={["==", "$type", "Polygon"]}
                />
                <Layer
                  id="batas-kabupaten-line"
                  type="line"
                  paint={{
                    "line-color": "#FF0000",
                    "line-width": 1.0,
                    "line-opacity": 0.7
                  }}
                />
              </Source>
            )}
            {selectedGeoJSONLayers.includes('kecamatan')
              && kecamatanGeoJSON
              && kecamatanGeoJSON.type === 'FeatureCollection'
              && Array.isArray(kecamatanGeoJSON.features)
              && kecamatanGeoJSON.features.length > 0 && (
              <Source id="batas-kecamatan" type="geojson" data={kecamatanGeoJSON}>
                <Layer
                  id="batas-kecamatan-fill"
                  type="fill"
                  paint={{
                    "fill-color": "#0000FF",
                    "fill-opacity": 0.05
                  }}
                  filter={["==", "$type", "Polygon"]}
                />
                <Layer
                  id="batas-kecamatan-line"
                  type="line"
                  paint={{
                    "line-color": "#0000FF",
                    "line-width": 1.0,
                    "line-opacity": 0.3
                  }}
                />
              </Source>
            )}
            {/* Popup untuk data Kecamatan */}
            {kecamatanPopup && selectedKecamatan && (
              <MemoPopup
                longitude={kecamatanPopup.longitude}
                latitude={kecamatanPopup.latitude}
                anchor="top"
                closeOnClick={false}
                onClose={() => {
                  setKecamatanPopup(null);
                  setSelectedKecamatan(null);
                }}
                className="z-50"
                closeButton={false}
              >
                <div className="relative min-w-[220px] max-w-[280px] rounded-2xl shadow-xl bg-white/90 p-3 flex flex-col items-center border-t-4 border-blue-400">
                  <button
                    onClick={() => {
                      setKecamatanPopup(null);
                      setSelectedKecamatan(null);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xl text-gray-700 hover:bg-gray-200 hover:text-black transition z-10 shadow"
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                  <div className="font-bold text-lg text-center mb-1 text-gray-800 flex items-center gap-2">
                    <span>🗺️ {selectedKecamatan.nama_kecamatan || 'Kecamatan'}</span>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    {Object.entries(selectedKecamatan).map(([key, value]) => {
                      // Skip if value is null or empty
                      if (!value) return null;
                      // Format the key to be more readable
                      const formattedKey = key
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      return (
                        <div key={key} className="flex flex-col bg-blue-50 rounded-lg p-2">
                          <span className="text-xs text-blue-800 font-semibold">{formattedKey}</span>
                          <span className="text-sm text-gray-700">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </MemoPopup>
            )}

            {/* Marker cluster rendering */}
            {clusterEnabled ? (
              clusters.map((cluster: any) => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                if (cluster.properties.cluster) {
                  // Cluster marker
                  // Find dominant category in cluster
                  let dominantCatId = null;
                  let dominantCount = 0;
                  let iconUrl = null;
                  if (cluster.properties.categoryCount) {
                    Object.entries(cluster.properties.categoryCount).forEach(([catId, count]: any) => {
                      if (count > dominantCount) {
                        dominantCount = count;
                        dominantCatId = catId;
                        iconUrl = cluster.properties.categoryIconMap[catId];
                      }
                    });
                  }
                  return (
                    <MemoMarker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude} anchor="center">
                      <button
                        className="focus:outline-none group"
                        style={{ background: "none", border: "none", padding: 0, margin: 0, transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s' }}
                        onClick={() => {
                          if (superclusterInstance && mapRef.current) {
                            const expansionZoom = Math.min(
                              superclusterInstance.getClusterExpansionZoom(cluster.id),
                              20
                            );
                            mapRef.current.flyTo({ center: [longitude, latitude], zoom: expansionZoom });
                          }
                        }}
                        aria-label="Zoom cluster"
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div className="relative flex flex-col items-center group-hover:scale-105 group-active:scale-95" style={{transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)'}}>
                          {iconUrl && (
                            <img src={iconUrl} alt="Cluster Icon" className="w-12 h-12 rounded-full border-4 border-green-400 bg-white object-cover shadow-lg" style={{transition: 'box-shadow 0.2s'}} loading="lazy" />
                          )}
                          <span className="absolute bottom-0 right-0 bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5 border border-white shadow">{cluster.properties.point_count_abbreviated}</span>
                        </div>
                      </button>
                    </MemoMarker>
                  );
                } else {
                  // Single marker (not cluster)
                  const dest = cluster.properties;
                  return (
                    <React.Fragment key={dest.id}>
                      <MemoMarker longitude={longitude} latitude={latitude} anchor="bottom">
                        <button
                          onClick={() => {
                            setSelectedDestination(destinations.find(d => d.id === dest.id) || null);
                            setViewport(v => ({ ...v, latitude, longitude, zoom: 15 }));
                          }}
                          className="focus:outline-none"
                          style={{ background: "none", border: "none", padding: 0, margin: 0, transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' }}
                          tabIndex={0}
                          aria-label={`Lihat info ${dest.name}`}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {dest.categoryIcon && (
                            <img
                              src={dest.categoryIcon}
                              alt={dest.categoryName}
                              className="w-10 h-10 rounded-full border-2 border-white shadow-lg bg-white object-cover animate-bounce-short"
                              style={{ transform: "translateY(-8px)", transition: 'box-shadow 0.2s' }}
                              loading="lazy"
                            />
                          )}
                        </button>
                      </MemoMarker>
                      {/* Popup info destinasi */}
                      {selectedDestination && selectedDestination.id === dest.id && (
                        <MemoPopup
                          longitude={longitude}
                          latitude={latitude}
                          anchor="top"
                          closeOnClick={false}
                          onClose={() => setSelectedDestination(null)}
                          className="z-50"
                          closeButton={false}
                        >
                          <div className="relative min-w-[220px] max-w-[280px] rounded-2xl shadow-xl bg-white/90 p-3 flex flex-col items-center border-t-4 border-yellow-400">
                            {/* Custom close button */}
                            <button
                              onClick={() => setSelectedDestination(null)}
                              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xl text-gray-700 hover:bg-gray-200 hover:text-black transition z-10 shadow"
                              aria-label="Tutup"
                            >
                              ×
                            </button>
                            {selectedDestination.thumbnailUrl && (
                              <img src={selectedDestination.thumbnailUrl} alt={selectedDestination.name} className="w-full h-28 object-cover rounded-xl mb-3 shadow select-none pointer-events-auto" draggable={false} loading="lazy" />
                            )}
                            <div className="font-bold text-lg text-center mb-1 text-gray-800 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-yellow-400" /> {selectedDestination.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-2 text-center">{selectedDestination.address}</div>
                            <div className="flex items-center gap-2 mt-1 bg-blue-50 rounded px-2 py-1 mb-2">
                              {selectedDestination.category?.icon && (
                                <img src={selectedDestination.category.icon} alt={selectedDestination.category.name} className="w-5 h-5 rounded-full" loading="lazy" />
                              )}
                              <span className="text-xs text-blue-800 font-semibold">{selectedDestination.category?.name}</span>
                            </div>
                            <button
                              className="w-full bg-gradient-to-r from-yellow-400 to-blue-500 hover:from-yellow-500 hover:to-blue-600 text-white font-bold py-2 rounded-xl transition text-xs mt-1 shadow-lg"
                              onClick={() => {
                                setRouteMenuOpen(true);
                                setRouteDest(selectedDestination.id);
                              }}
                            >
                              <span className="flex items-center gap-2 justify-center"><FaLocationArrow /> Rute</span>
                            </button>
                          </div>
                        </MemoPopup>
                      )}
                    </React.Fragment>
                  );
                }
              })
            ) : (
              // Default: non-clustered markers
              (nearbyMenuOpen ? nearbyList : filteredDestinations).map((dest) => (
                <React.Fragment key={dest.id}>
                  <MemoMarker longitude={dest.longitude} latitude={dest.latitude} anchor="bottom">
                    <button
                      onClick={() => {
                        setSelectedDestination(dest);
                        setViewport(v => ({ ...v, latitude: dest.latitude, longitude: dest.longitude, zoom: 15 }));
                      }}
                      className="focus:outline-none"
                      style={{ background: "none", border: "none", padding: 0, margin: 0 }}
                      tabIndex={0}
                      aria-label={`Lihat info ${dest.name}`}
                    >
                      {dest.category?.icon && (
                        <img
                          src={dest.category.icon}
                          alt={dest.category.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-lg bg-white object-cover animate-bounce-short"
                          style={{ transform: "translateY(-8px)" }}
                          loading="lazy"
                        />
                      )}
                    </button>
                  </MemoMarker>
                  {/* Popup info destinasi */}
                  {selectedDestination && selectedDestination.id === dest.id && (
                    <MemoPopup
                      longitude={dest.longitude}
                      latitude={dest.latitude}
                      anchor="top"
                      closeOnClick={false}
                      onClose={() => setSelectedDestination(null)}
                      className="z-50"
                      closeButton={false}
                    >
                      <div className="relative min-w-[220px] max-w-[280px] rounded-2xl shadow-xl bg-white/90 p-3 flex flex-col items-center border-t-4 border-yellow-400">
                        {/* Custom close button */}
                        <button
                          onClick={() => setSelectedDestination(null)}
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-xl text-gray-700 hover:bg-gray-200 hover:text-black transition z-10 shadow"
                          aria-label="Tutup"
                        >
                          ×
                        </button>
                        {selectedDestination.thumbnailUrl && (
                          <img src={selectedDestination.thumbnailUrl} alt={selectedDestination.name} className="w-full h-28 object-cover rounded-xl mb-3 shadow select-none pointer-events-auto" draggable={false} loading="lazy" />
                        )}
                        <div className="font-bold text-lg text-center mb-1 text-gray-800 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-yellow-400" /> {selectedDestination.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-2 text-center">{selectedDestination.address}</div>
                        <div className="flex items-center gap-2 mt-1 bg-blue-50 rounded px-2 py-1 mb-2">
                          {selectedDestination.category?.icon && (
                            <img src={selectedDestination.category.icon} alt={selectedDestination.category.name} className="w-5 h-5 rounded-full" loading="lazy" />
                          )}
                          <span className="text-xs text-blue-800 font-semibold">{selectedDestination.category?.name}</span>
                        </div>
                        <button
                          className="w-full bg-gradient-to-r from-yellow-400 to-blue-500 hover:from-yellow-500 hover:to-blue-600 text-white font-bold py-2 rounded-xl transition text-xs mt-1 shadow-lg"
                          onClick={() => {
                            setRouteMenuOpen(true);
                            setRouteDest(selectedDestination.id);
                          }}
                        >
                          <span className="flex items-center gap-2 justify-center"><FaLocationArrow /> Rute</span>
                        </button>
                      </div>
                    </MemoPopup>
                  )}
                </React.Fragment>
              ))
            )}
            {/* Panel kontrol pojok kanan atas */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-1 items-end sm:top-8 sm:right-8">
              <div className="bg-white/90 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-1 p-1">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-yellow-100 transition text-base"
                  onClick={() => {
                    if (mapRef.current) {
                      const z = mapRef.current.getZoom();
                      mapRef.current.zoomTo(Math.min(z + 1, 20));
                    }
                  }}
                  aria-label="Zoom In"
                >
                  <FaPlus />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-yellow-100 transition text-base"
                  onClick={() => {
                    if (mapRef.current) {
                      const z = mapRef.current.getZoom();
                      mapRef.current.zoomTo(Math.max(z - 1, 1));
                    }
                  }}
                  aria-label="Zoom Out"
                >
                  <FaMinus />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 transition text-base"
                  onClick={async () => {
                    if (!navigator.geolocation) return alert("Geolocation tidak didukung browser Anda");
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        if (mapRef.current) {
                          mapRef.current.flyTo({center: [pos.coords.longitude, pos.coords.latitude], zoom: 15});
                        }
                      },
                      err => alert("Gagal mendapatkan lokasi Anda")
                    );
                  }}
                  aria-label="Geolokasi"
                >
                  <FaCrosshairs />
                </button>
                <div className="relative">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-base"
                    onClick={() => setShowBasemapMenu(v => !v)}
                    aria-label="Ganti Basemap"
                  >
                    <FaLayerGroup />
                  </button>
                  {showBasemapMenu && (
                    <div className="absolute right-12 top-0 bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col min-w-[120px] animate-fade-in-up">
                      <button className={`px-4 py-2 text-left hover:bg-yellow-100 ${mapStyle.includes('streets') ? 'font-bold text-blue-700' : ''}`} onClick={() => { setMapStyle("mapbox://styles/mapbox/streets-v11"); setShowBasemapMenu(false); }}>Streets</button>
                      <button className={`px-4 py-2 text-left hover:bg-yellow-100 ${mapStyle.includes('satellite') ? 'font-bold text-blue-700' : ''}`} onClick={() => { setMapStyle("mapbox://styles/mapbox/satellite-streets-v11"); setShowBasemapMenu(false); }}>Satellite</button>
                      <button className={`px-4 py-2 text-left hover:bg-yellow-100 ${mapStyle.includes('light') ? 'font-bold text-blue-700' : ''}`} onClick={() => { setMapStyle("mapbox://styles/mapbox/light-v11"); setShowBasemapMenu(false); }}>Light</button>
                      <button className={`px-4 py-2 text-left hover:bg-yellow-100 ${mapStyle.includes('dark') ? 'font-bold text-blue-700' : ''}`} onClick={() => { setMapStyle("mapbox://styles/mapbox/dark-v11"); setShowBasemapMenu(false); }}>Dark</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Marker lokasi user */}
            {userLocation && (
              <MemoMarker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="block w-3 h-3 md:w-2 md:h-2 bg-white rounded-full"></span>
                </div>
              </MemoMarker>
            )}
          </Map>
        </Suspense>
        {/* Dropup filter kategori pojok kanan bawah */}
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end">
          <div className="relative">
            <button
              className="w-14 h-14 rounded-full bg-[#FFD600] shadow-lg flex items-center justify-center text-2xl text-black border-2 border-white hover:bg-yellow-400 transition"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Filter Kategori"
            >
              <FaMapMarkerAlt />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 bottom-16 w-48 bg-white rounded-xl shadow-lg border border-gray-100 max-h-72 overflow-y-auto animate-fade-in-up">
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-[#FFD600] hover:text-black rounded-t-xl ${!selectedCategory ? "bg-[#FFD600] text-black" : "text-gray-700"}`}
                  onClick={() => { setSelectedCategory(null); setDropdownOpen(false); }}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full text-left px-4 py-2 hover:bg-[#FFD600] hover:text-black ${selectedCategory === cat.id ? "bg-[#FFD600] text-black" : "text-gray-700"}`}
                    onClick={() => { setSelectedCategory(cat.id); setDropdownOpen(false); }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Info rute dengan desain lebih menarik */}
        {routeInfo && (
          <div
            className="fixed left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-blue-50 to-yellow-100 rounded-2xl shadow-2xl border-2 border-yellow-300 flex flex-col items-center gap-3 animate-fade-in-up backdrop-blur-md"
            style={{
              bottom: '6rem', // default desktop
              width: 'auto',
              maxWidth: '95vw',
              padding: '1.25rem 2rem',
            }}
          >
            <style>{`
              @media (max-width: 640px) {
                .mobile-route-info {
                  bottom: 7.5rem !important;
                  padding: 0.75rem 0.5rem !important;
                  min-width: 90vw !important;
                  max-width: 98vw !important;
                }
              }
            `}</style>
            <div className="mobile-route-info" style={{width: '100%'}}>
              <div className="flex items-center gap-3 mb-1">
                <FaLocationArrow className="text-blue-500 text-2xl" />
                <span className="text-lg font-bold text-blue-800 tracking-wide">Info Rute</span>
              </div>
              <div className="flex gap-6 mb-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Jarak</span>
                  <span className="text-xl font-bold text-yellow-600">{(routeInfo.distance/1000).toFixed(2)} km</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Estimasi</span>
                  <span className="text-xl font-bold text-blue-600">{Math.round(routeInfo.duration/60)} menit</span>
                </div>
              </div>
              {/* Progress bar visualisasi jarak (max 50km) */}
              <div className="w-full max-w-xs h-3 bg-gray-200 rounded-full overflow-hidden mb-2 mx-auto">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-blue-500" style={{ width: `${Math.min(routeInfo.distance/1000/50*100,100)}%` }}></div>
              </div>
              <button
                className="mt-1 px-6 py-2 rounded-xl bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white text-sm font-bold shadow-lg transition w-full"
                onClick={() => { setRouteGeoJSON(null); setRouteInfo(null); }}
              >
                Tutup Rute
              </button>
            </div>
          </div>
        )}
        {/* Tombol layer GeoJSON di kanan bawah */}
        <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end">
          <button
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl border-2 transition ${selectedGeoJSONLayers.length > 0 ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-100'}`}
            onClick={() => setGeoJSONMenuOpen(v => !v)}
            aria-label="Tampilkan Layer GeoJSON"
          >
            🗺️
          </button>
          {geoJSONMenuOpen && (
            <div className="mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 max-h-72 overflow-y-auto animate-fade-in-up">
              <label className="flex items-center px-4 py-2 hover:bg-orange-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGeoJSONLayers.includes('jalan')}
                  onChange={() => toggleGeoJSONLayer('jalan')}
                  className="mr-2"
                />
                Jaringan Jalan
              </label>
              <label className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGeoJSONLayers.includes('kereta')}
                  onChange={() => toggleGeoJSONLayer('kereta')}
                  className="mr-2"
                />
                Jaringan Rel Kereta Api
              </label>
              <label className="flex items-center px-4 py-2 hover:bg-green-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGeoJSONLayers.includes('kecamatan')}
                  onChange={() => toggleGeoJSONLayer('kecamatan')}
                  className="mr-2"
                />
                Batas Kecamatan
              </label>
              <label className="flex items-center px-4 py-2 hover:bg-green-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGeoJSONLayers.includes('kabupaten')}
                  onChange={() => toggleGeoJSONLayer('kabupaten')}
                  className="mr-2"
                />
                Batas Kabupaten
              </label>
              
            </div>
          )}
        </div>
        {/* Tombol ON/OFF cluster di kanan bawah */}
        <div className="fixed bottom-40 right-6 z-40 flex flex-col items-end">
          <button
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl border-2 transition ${clusterEnabled ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-100'}`}
            onClick={() => setClusterEnabled(v => !v)}
            aria-label="Tombol Cluster Marker"
          >
            {clusterEnabled ? '🟢' : '⚪'}
          </button>
        </div>
      </div>
    </div>
  );
}