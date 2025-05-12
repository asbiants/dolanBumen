"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-fallback";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Calendar,
  Star,
  MapIcon,
  ArrowLeft,
  Share2,
  Heart,
  Ticket,
  Info,
} from "lucide-react";
import { MapContainer } from "@/components/map/MapContainer";
import { notFound } from "next/navigation";

// Sample destinations data (in a real app this would come from an API or database)
const SAMPLE_DESTINATIONS = [
  {
    id: "1",
    name: "Pantai Petanahan",
    description:
      "Beautiful beach with white sand and clear water in Kebumen, perfect for a relaxing day by the sea. Enjoy swimming, sunbathing, and local seafood restaurants.",
    fullDescription: `
      <p>Pantai Petanahan is one of the most popular beaches in Kebumen, Central Java. It features beautiful white sand and clear blue water, making it perfect for swimming, sunbathing, and various water activities.</p>
      <p>The beach is easily accessible and offers various facilities including food stalls, restrooms, parking area, and beach equipment rentals. Local seafood restaurants serve fresh catches of the day with authentic local flavors.</p>
      <p>Visitors can enjoy stunning sunrise and sunset views, making it a favorite spot for photographers. The area is family-friendly with safe swimming zones and lifeguards on duty during peak hours.</p>
      <p>The beach is surrounded by fishing villages where you can observe local fishermen's daily activities and even join fishing trips organized by local tour operators.</p>
    `,
    image: "/images/pantai-petanahan.jpg",
    gallery: [
      "/images/pantai-petanahan.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
    ],
    category: "Beach",
    rating: 4.7,
    location: "Petanahan, Kebumen, Central Java",
    latitude: -7.7007,
    longitude: 109.5155,
    openingHours: "06:00 - 18:00",
    ticketPrice: "Rp 10.000",
    facilities: [
      "Parking",
      "Restrooms",
      "Food Stalls",
      "Lifeguards",
      "Equipment Rental",
    ],
  },
  {
    id: "2",
    name: "Goa Jatijajar",
    description:
      "Famous limestone cave with underground river and beautiful stalactites and stalagmites. Explore the cave's natural formations and learn about local legends.",
    fullDescription: `
      <p>Goa Jatijajar is a magnificent limestone cave located in Kebumen, Central Java. The cave features impressive stalactites, stalagmites, and an underground river that flows through it.</p>
      <p>The cave is approximately 250 meters long and has been developed into a popular tourist attraction with proper lighting and pathways for visitors to explore safely. Inside, you'll find various chambers with unique formations that have taken thousands of years to form.</p>
      <p>Local legends are associated with the cave, which guides will share during your visit. There are statues depicting characters from these legends placed throughout the cave.</p>
      <p>The area around the cave has been developed with facilities including a small park, food stalls, souvenir shops, and a museum showcasing the geological and historical significance of the area.</p>
    `,
    image: "/images/goa-jatijajar.jpg",
    gallery: [
      "/images/goa-jatijajar.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
    ],
    category: "Nature",
    rating: 4.5,
    location: "Jatijajar, Kebumen, Central Java",
    latitude: -7.7422,
    longitude: 109.7091,
    openingHours: "08:00 - 17:00",
    ticketPrice: "Rp 15.000",
    facilities: [
      "Parking",
      "Restrooms",
      "Food Stalls",
      "Guided Tours",
      "Souvenir Shops",
    ],
  },
  {
    id: "3",
    name: "Benteng Van Der Wijck",
    description:
      "Historical Dutch fortress from colonial era with unique octagonal architecture. Discover Indonesia's colonial history through exhibitions and guided tours.",
    fullDescription: `
      <p>Benteng Van Der Wijck is a historical fortress built by the Dutch colonial government in 1818. The fortress has a unique octagonal design, which is rare among colonial structures in Indonesia.</p>
      <p>The fortress was originally built as a defensive structure and military base, strategically located to control the area. Today, it serves as a museum and historical site where visitors can learn about Indonesia's colonial history.</p>
      <p>Inside the fortress, you'll find various exhibitions displaying historical artifacts, weapons, photographs, and documents from the colonial era. There are also detailed models and information about the architectural significance of the building.</p>
      <p>Guided tours are available, providing in-depth information about the fortress's history, architecture, and its role during the colonial period and Indonesia's struggle for independence.</p>
    `,
    image: "/images/benteng-van-der-wijck.jpg",
    gallery: [
      "/images/benteng-van-der-wijck.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
    ],
    category: "History",
    rating: 4.3,
    location: "Gombong, Kebumen, Central Java",
    latitude: -7.6047,
    longitude: 109.5132,
    openingHours: "08:00 - 16:00",
    ticketPrice: "Rp 10.000",
    facilities: [
      "Parking",
      "Restrooms",
      "Museum",
      "Guided Tours",
      "Photo Spots",
    ],
  },
  {
    id: "4",
    name: "Waduk Sempor",
    description:
      "Beautiful reservoir with surrounding hills and water activities like fishing and boating. Enjoy the serene atmosphere and stunning views of the mountains.",
    fullDescription: `
      <p>Waduk Sempor is a picturesque reservoir surrounded by hills and lush vegetation in Kebumen, Central Java. The dam was built in the 1970s and serves both as a water supply source and a popular tourist destination.</p>
      <p>Visitors can enjoy various water activities including fishing, boating, and paddling. The calm waters reflect the surrounding hills, creating perfect photo opportunities, especially during sunrise and sunset.</p>
      <p>The area around the reservoir features walking paths and viewpoints where you can enjoy panoramic views of the water and surrounding landscape. It's a popular spot for picnics and family outings.</p>
      <p>Local food vendors offer traditional snacks and meals, and there are facilities for visitors including shelters, restrooms, and parking areas. The reservoir is also an important ecological area with various bird species.</p>
    `,
    image: "/images/placeholder.jpg",
    gallery: [
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
      "/images/placeholder.jpg",
    ],
    category: "Nature",
    rating: 4.4,
    location: "Sempor, Kebumen, Central Java",
    latitude: -7.5553,
    longitude: 109.4906,
    openingHours: "06:00 - 18:00",
    ticketPrice: "Rp 8.000",
    facilities: [
      "Parking",
      "Restrooms",
      "Food Stalls",
      "Boat Rental",
      "Fishing Spots",
    ],
  },
];

export default function DestinationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const destination = SAMPLE_DESTINATIONS.find((d) => d.id === id);

  const [activeTab, setActiveTab] = useState<
    "overview" | "location" | "reviews"
  >("overview");
  const [activeImage, setActiveImage] = useState(0);

  if (!destination) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/destinations"
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to all destinations</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{destination.name}</h1>
            <div className="flex items-center gap-1 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{destination.location}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="ml-1">{destination.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="h-4 w-4" />
              Save
            </Button>
            <Link href={`/booking/${id}`}>
              <Button size="sm" className="gap-1">
                <Ticket className="h-4 w-4" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
            <div className="relative h-80 md:h-96">
              <ImageWithFallback
                src={destination.gallery[activeImage]}
                alt={destination.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {destination.gallery.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                      activeImage === index ? "ring-2 ring-indigo-600" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${destination.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "overview"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "location"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                  onClick={() => setActiveTab("location")}
                >
                  Location
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "reviews"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    About {destination.name}
                  </h2>
                  <div
                    className="prose text-gray-700 mb-6"
                    dangerouslySetInnerHTML={{
                      __html: destination.fullDescription,
                    }}
                  />

                  <h3 className="text-lg font-semibold mb-3">Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                    {destination.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                        <span className="text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Location</h2>
                  <div className="h-[300px] mb-6">
                    <MapContainer
                      destinations={[
                        {
                          id: destination.id,
                          name: destination.name,
                          description: destination.description,
                          address: destination.location,
                          latitude: destination.latitude,
                          longitude: destination.longitude,
                          categoryName: destination.category,
                          status: "active",
                        },
                      ]}
                      height="h-[300px]"
                      showFilter={false}
                    />
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Reviews</h2>
                  <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
                    <p className="text-gray-500 mb-2">No reviews yet</p>
                    <p className="text-sm text-gray-400">
                      Be the first to leave a review
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl overflow-hidden shadow-md mb-6 sticky top-24">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Visit Information</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Opening Hours</h3>
                  <p className="text-gray-600">{destination.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Ticket className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Entrance Fee</h3>
                  <p className="text-gray-600">
                    {destination.ticketPrice} / person
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Address</h3>
                  <p className="text-gray-600">{destination.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Best Time to Visit</h3>
                  <p className="text-gray-600">
                    Weekday mornings for fewer crowds
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link href={`/booking/${id}`}>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Tickets
                  </Button>
                </Link>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center text-indigo-600 hover:text-indigo-800"
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
