import Link from "next/link";
import { MapPin, MapIcon, Ticket, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-fallback";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Explore Kebumen's Beautiful Destinations
              </h1>
              <p className="text-lg mb-8 text-indigo-100">
                Discover natural wonders, historical sites, and cultural
                experiences in Kebumen with our interactive map and easy booking
                system.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50"
                >
                  <Link href="/map">
                    <MapIcon className="mr-2 h-5 w-5" />
                    Explore Map
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-indigo-800"
                >
                  <Link href="/destinations">
                    <MapPin className="mr-2 h-5 w-5" />
                    View Destinations
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block h-[400px] rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 z-10 bg-black/20 rounded-xl" />
              <div className="relative w-full h-full">
                <ImageWithFallback
                  src="/images/kebumen-landscape.jpg"
                  alt="Kebumen Landscape"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explore With Our Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <MapIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
              <p className="text-gray-600 mb-4">
                Explore destinations with our interactive map featuring 3D
                buildings, custom layers, and detailed information.
              </p>
              <Link
                href="/map"
                className="text-indigo-600 font-medium hover:text-indigo-800 inline-flex items-center"
              >
                Explore Map
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Ticket className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600 mb-4">
                Book tickets for your favorite destinations with our simple
                booking system and multiple payment options.
              </p>
              <Link
                href="/destinations"
                className="text-indigo-600 font-medium hover:text-indigo-800 inline-flex items-center"
              >
                Browse Destinations
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">E-Tickets</h3>
              <p className="text-gray-600 mb-4">
                Get digital tickets with QR codes for quick and easy entry to
                all tourism destinations.
              </p>
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:text-indigo-800 inline-flex items-center"
              >
                Login to View Tickets
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Featured Destinations
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover some of the most popular tourist attractions in Kebumen,
            from beautiful beaches to historical sites and natural wonders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: "1",
                name: "Pantai Petanahan",
                description: "Beautiful beach with white sand and clear water",
                image: "/images/pantai-petanahan.jpg",
                category: "Beach",
              },
              {
                id: "2",
                name: "Goa Jatijajar",
                description: "Famous limestone cave with underground river",
                image: "/images/goa-jatijajar.jpg",
                category: "Nature",
              },
              {
                id: "3",
                name: "Benteng Van Der Wijck",
                description: "Historical Dutch fortress from colonial era",
                image: "/images/benteng-van-der-wijck.jpg",
                category: "History",
              },
            ].map((destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full">
                      {destination.category}
                    </span>
                    <h3 className="text-xl font-semibold text-white mt-2">
                      {destination.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4">
                    {destination.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/destinations/${destination.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/map?destination=${destination.id}`}
                      className="text-gray-600 hover:text-indigo-600 flex items-center text-sm"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      View on Map
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/destinations">
                View All Destinations
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Kebumen?</h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
            Create an account to book tickets, save your favorite destinations,
            and access e-tickets for your adventures.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-indigo-800"
            >
              <Link href="/map">
                <MapIcon className="mr-2 h-5 w-5" />
                Explore Map
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
