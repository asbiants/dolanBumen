import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-fallback";
import { MapPin, Calendar, Star, Filter } from "lucide-react";

// Sample destinations data (in a real app this would come from an API or database)
const SAMPLE_DESTINATIONS = [
  {
    id: "1",
    name: "Pantai Petanahan",
    description:
      "Beautiful beach with white sand and clear water in Kebumen, perfect for a relaxing day by the sea. Enjoy swimming, sunbathing, and local seafood restaurants.",
    image: "/images/pantai-petanahan.jpg",
    category: "Beach",
    rating: 4.7,
    location: "Petanahan, Kebumen, Central Java",
  },
  {
    id: "2",
    name: "Goa Jatijajar",
    description:
      "Famous limestone cave with underground river and beautiful stalactites and stalagmites. Explore the cave's natural formations and learn about local legends.",
    image: "/images/goa-jatijajar.jpg",
    category: "Nature",
    rating: 4.5,
    location: "Jatijajar, Kebumen, Central Java",
  },
  {
    id: "3",
    name: "Benteng Van Der Wijck",
    description:
      "Historical Dutch fortress from colonial era with unique octagonal architecture. Discover Indonesia's colonial history through exhibitions and guided tours.",
    image: "/images/benteng-van-der-wijck.jpg",
    category: "History",
    rating: 4.3,
    location: "Gombong, Kebumen, Central Java",
  },
  {
    id: "4",
    name: "Waduk Sempor",
    description:
      "Beautiful reservoir with surrounding hills and water activities like fishing and boating. Enjoy the serene atmosphere and stunning views of the mountains.",
    image: "/images/placeholder.jpg",
    category: "Nature",
    rating: 4.4,
    location: "Sempor, Kebumen, Central Java",
  },
];

export default function DestinationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tourist Destinations</h1>
          <p className="text-gray-600">
            Discover beautiful places to visit in Kebumen
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <Link href="/map">
            <Button size="sm" className="gap-2">
              <MapPin className="h-4 w-4" />
              View on Map
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {SAMPLE_DESTINATIONS.map((destination) => (
          <div
            key={destination.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative h-56">
              <ImageWithFallback
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                {destination.rating}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-4 px-4">
                <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full">
                  {destination.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {destination.name}
                </h3>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start mb-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1 mr-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">{destination.location}</p>
              </div>

              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {destination.description}
              </p>

              <div className="flex justify-between items-center">
                <Link
                  href={`/destinations/${destination.id}`}
                  className="text-indigo-600 font-medium text-sm hover:text-indigo-800"
                >
                  View Details
                </Link>

                <Link
                  href={`/booking/${destination.id}`}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 text-sm px-3 py-1.5 rounded-full font-medium flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <p className="text-gray-500">More destinations coming soon...</p>
      </div>
    </div>
  );
}
