'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar/navbar';

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface TouristDestination {
  id: string;
  name: string;
  description: string;
  address?: string;
  latitude: number;
  longitude: number;
  category: { id: string; name: string };
  thumbnailUrl?: string;
}

interface DestinationCategory {
  id: string;
  name: string;
  icon?: string | null;
}

const fetchDestinations = async (): Promise<TouristDestination[]> => {
  const res = await fetch('/api/admin/tourist-destinations');
  if (!res.ok) throw new Error('Failed to fetch destinations');
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
};

const fetchCategories = async (): Promise<DestinationCategory[]> => {
  const res = await fetch('/api/admin/destination-categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data || []);
};

const StoryMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<TouristDestination | null>(null);
  const [destinations, setDestinations] = useState<TouristDestination[]>([]);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data destinasi & kategori secara paralel dan efisien
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      fetchDestinations(),
      fetchCategories()
    ])
      .then(([dest, cats]) => {
        if (isMounted) {
          setDestinations(dest);
          setCategories(cats);
        }
      })
      .finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [110.3214, -8.0125],
      zoom: 9
    });
    map.current.on('load', () => setMapLoaded(true));
    return () => {
      map.current?.remove();
    };
  }, []);

  // Render markers setiap destinations/mapLoaded/kategori berubah
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    // Buat map kategoriId ke icon
    const categoryIconMap: Record<string, string | null | undefined> = {};
    categories.forEach(cat => { categoryIconMap[cat.id] = cat.icon; });
    // Hapus marker lama
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];
    destinations.forEach(destination => {
      // Validasi data koordinat
      const lon = typeof destination.longitude === 'string' ? parseFloat(destination.longitude) : destination.longitude;
      const lat = typeof destination.latitude === 'string' ? parseFloat(destination.latitude) : destination.latitude;
      if (
        lon == null || lat == null ||
        isNaN(lon) || isNaN(lat) ||
        lon < -180 || lon > 180 ||
        lat < -90 || lat > 90
      ) {
        console.warn('Data marker invalid:', destination);
        return;
      }
      // Gunakan icon kategori jika ada
      const iconUrl = categoryIconMap[destination.category?.id] || '/marker.png';
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.backgroundImage = `url('${iconUrl}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lon, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3>${destination.name}</h3>
              <p>${destination.description}</p>
            `)
        )
        .addTo(map.current!);
      el.addEventListener('click', () => {
        setSelectedDestination(destination);
      });
      markerRefs.current.push(marker);
    });
  }, [destinations, mapLoaded, categories]);

  // Filter destinasi sesuai kategori
  const filteredDestinations = selectedCategoryId
    ? destinations.filter(d => d.category?.id === selectedCategoryId)
    : destinations;

  // Intersection Observer for flyTo on scroll
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const idx = cardRefs.current.findIndex(ref => ref === entry.target);
        const dest = filteredDestinations[idx];
        if (dest && map.current) {
          setSelectedDestination(dest);
          map.current.flyTo({
            center: [dest.longitude, dest.latitude],
            zoom: 14,
            duration: 2000
          });
        }
      }
    });
  }, [filteredDestinations]);

  useEffect(() => {
    if (!filteredDestinations.length) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(handleIntersection, {
      root: document.querySelector('#story-scroll-area'),
      threshold: 0.5
    });
    cardRefs.current = cardRefs.current.slice(0, filteredDestinations.length);
    cardRefs.current.forEach(ref => {
      if (ref) observer.current?.observe(ref);
    });
    return () => observer.current?.disconnect();
  }, [filteredDestinations, handleIntersection]);

  // Fit map to all markers when map and destinations are ready
  useEffect(() => {
    if (!map.current || !mapLoaded || destinations.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    destinations.forEach(dest => {
      if (dest.longitude != null && dest.latitude != null) {
        bounds.extend([dest.longitude, dest.latitude]);
      }
    });
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 60, animate: true });
    }
  }, [mapLoaded, destinations]);

  // Disable all zoom interactions
  useEffect(() => {
    if (!map.current) return;
    map.current.scrollZoom.disable();
    map.current.boxZoom.disable();
    map.current.doubleClickZoom.disable();
    map.current.dragRotate.disable();
    map.current.dragPan.enable(); // allow pan
    map.current.keyboard.disable();
    map.current.touchZoomRotate.disable();
    map.current.touchPitch.disable();
  }, [mapLoaded]);

  // Tambahkan useEffect untuk trigger map.resize() saat window resize di mobile
  useEffect(() => {
    if (!map.current) return;
    const handleResize = () => {
      map.current && map.current.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row h-screen">
        {/* Map Section */}
        <div className="w-full md:w-[60%] h-64 md:h-full relative order-1 md:order-none min-w-0 overflow-hidden">
          <div ref={mapContainer} className="w-full h-full min-w-0" />
        </div>

        {/* Story Section */}
        <div className="w-full md:w-[40%] h-[calc(100vh-16rem)] md:h-full bg-white p-4 overflow-hidden order-2 md:order-none">
          <h1 className="text-2xl font-bold mb-4">Destinasi Wisata</h1>
          {/* Filter kategori */}
          <div className="w-full overflow-x-auto pb-3 px-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-nowrap gap-3 md:grid md:grid-cols-4 md:gap-2 whitespace-nowrap md:whitespace-normal">
              <button
                className={`flex-shrink-0 w-auto min-w-[110px] max-w-[140px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center text-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm hover:shadow-md ${
                  selectedCategoryId === null
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
                aria-pressed={selectedCategoryId === null}
                onClick={() => setSelectedCategoryId(null)}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`flex-shrink-0 w-auto min-w-[110px] max-w-[140px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center text-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm hover:shadow-md ${
                    selectedCategoryId === cat.id
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                  }`}
                  aria-pressed={selectedCategoryId === cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  title={cat.name}
                >
                  {cat.icon && (
                    <img src={cat.icon} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">Memuat data destinasi...</div>
          ) : (
            <ScrollArea className="h-[calc(100vh-22rem)] md:h-[calc(100%-7rem)]" id="story-scroll-area">
              <div className="space-y-4">
                {filteredDestinations.map((destination, idx) => (
                  <Card
                    key={destination.id}
                    ref={el => { cardRefs.current[idx] = el; }}
                    className={`cursor-pointer transition-all ${
                      selectedDestination?.id === destination.id
                        ? 'border-primary shadow-lg'
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 relative rounded-md overflow-hidden">
                          <img
                            src={destination.thumbnailUrl || '/default.jpg'}
                            alt={destination.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{destination.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {destination.category?.name}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-2">
                            {destination.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </>
  );
};

export default StoryMap;
