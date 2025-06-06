"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Loading from "@/components/loading/loading";
import dynamic from "next/dynamic";
import { Marker, Popup, MapRef } from "react-map-gl";
import TourismStory from "./TourismStory";
import { stories } from "./config";

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

export default function StoryMapPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, destRes] = await Promise.all([
          fetch("/api/admin/destination-categories"),
          fetch("/api/admin/tourist-destinations"),
        ]);
        const catData = await catRes.json();
        const destData = await destRes.json();
        setCategories(catData);
        setDestinations(Array.isArray(destData.data) ? destData.data : []);
      } catch (err) {
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: validasi koordinat Indonesia
  function isValidLngLat(lng: number, lat: number) {
    // Indonesia: longitude 95-141, latitude -11 sampai 6
    return (
      typeof lng === 'number' && typeof lat === 'number' &&
      lng >= 95 && lng <= 141 &&
      lat >= -11 && lat <= 6
    );
  }

  // Generate flyTo otomatis jika belum ada atau tidak valid, setelah data destinasi didapat
  const computedStories = stories.map(story => {
    let flyTo = story.flyTo;
    if (
      (!flyTo ||
        typeof flyTo.longitude !== 'number' ||
        typeof flyTo.latitude !== 'number' ||
        isNaN(flyTo.longitude) ||
        isNaN(flyTo.latitude) ||
        !isValidLngLat(flyTo.longitude, flyTo.latitude)) &&
      story.type === "category" && story.categoryId
    ) {
      const dest = destinations.find(d => d.category?.id === story.categoryId);
      if (dest) {
        const lng = Number(dest.longitude);
        const lat = Number(dest.latitude);
        if (isValidLngLat(lng, lat)) {
          flyTo = { longitude: lng, latitude: lat, zoom: 13 };
        }
      }
    }
    return { ...story, flyTo };
  });

  // Intersection Observer untuk auto flyTo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target instanceof HTMLElement) {
          const idx = Number(entry.target.dataset.idx);
          if (!isNaN(idx) && idx !== activeIndex) {
            setActiveIndex(idx);
            const story = computedStories[idx];
            if (story?.flyTo && mapRef.current) {
              mapRef.current.flyTo({
                center: [story.flyTo.longitude, story.flyTo.latitude],
                zoom: story.flyTo.zoom,
                essential: true
              });
            }
          }
        }
      });
    };
    const observer = new window.IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "0px",
      threshold: 0.6,
    });
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line
  }, [stories.length, destinations.length]);

  if (loading) return <><Navbar /><Loading /></>;
  if (error) return <><Navbar /><div>{error}</div></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col-reverse md:flex-row">
        {/* Kiri: Cerita scrollable section */}
        <div className="w-full md:basis-[30%] md:max-w-[30%] h-screen max-h-screen overflow-y-auto px-0 md:px-0 py-0 md:py-0 flex flex-col">
          {computedStories.map((story, idx) => {
            return (
              <div
                key={story.id}
                ref={el => { sectionRefs.current[idx] = el; }}
                data-idx={idx}
                className={`w-full max-w-3xl bg-white py-12 px-4 md:px-8 mb-6 transition-all duration-200 ${activeIndex === idx ? 'shadow-2xl border-l-4 border-yellow-400' : ''}`}
                style={{ margin: 0 }}
              >
                <TourismStory story={story} />
              </div>
            );
          })}
        </div>
        {/* Kanan: Peta tetap */}
        <div className="w-full md:basis-[70%] md:max-w-[70%] h-[400px] md:h-screen min-h-[400px] flex items-center justify-center sticky top-0">
          <div className="w-full h-full min-h-[400px]">
            <Map
              ref={mapRef}
              initialViewState={{
                latitude: -7.6778,
                longitude: 109.6536,
                zoom: 10,
              }}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Marker hanya untuk cerita kategori yang sedang aktif */}
              {computedStories[activeIndex]?.type === "category" &&
                computedStories[activeIndex]?.categoryId &&
                Array.isArray(destinations) &&
                destinations.filter((d) => d.category?.id === computedStories[activeIndex].categoryId).length > 0 &&
                destinations
                  .filter((d) => d.category?.id === computedStories[activeIndex].categoryId)
                  .map((dest) => {
                    const lng = Number(dest.longitude);
                    const lat = Number(dest.latitude);
                    if (!isValidLngLat(lng, lat)) return null;
                    const category = categories.find(c => c.id === dest.category?.id);
                    if (!category || !category.icon) return null;
                    return (
                      <Marker
                        key={dest.id}
                        longitude={lng}
                        latitude={lat}
                        anchor="bottom"
                        onClick={() => setShowPopup(dest.id)}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer bg-white border-2 border-yellow-400">
                          <img src={category.icon} alt={category.name} className="object-contain w-8 h-8" />
                        </div>
                        {showPopup === dest.id && (
                          <Popup
                            longitude={lng}
                            latitude={lat}
                            anchor="top"
                            onClose={() => setShowPopup(null)}
                          >
                            <div>
                              <div className="font-bold">{dest.name}</div>
                              <div className="text-xs">{dest.address}</div>
                            </div>
                          </Popup>
                        )}
                      </Marker>
                    );
                  })
              }
            </Map>
          </div>
        </div>
      </div>
    </>
  );
}
