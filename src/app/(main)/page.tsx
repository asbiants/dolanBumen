export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to DolanBumen</h1>
      <p className="text-lg mb-4">
        Explore the best tourist destinations in Kebumen with our interactive
        maps and booking features.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Discover Destinations</h2>
          <p>
            Browse through our curated list of tourist attractions in Kebumen.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Interactive Maps</h2>
          <p>
            Find your way using our interactive map feature with detailed
            directions.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Book Online</h2>
          <p>
            Secure your tickets in advance with our easy online booking system.
          </p>
        </div>
      </div>
    </div>
  );
}
