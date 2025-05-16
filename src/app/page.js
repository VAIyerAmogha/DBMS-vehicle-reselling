"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto min-h-[400px] py-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Vehicle Reselling Platform
        </h1>
        <div className="flex items-center gap-8 mb-6 min-h-[200px]">
          <p className="text-gray-700 flex-1 text-lg leading-relaxed">
            Discover, buy, and sell pre-owned vehicles with ease. Our platform
            connects buyers and sellers, providing a seamless experience for
            listing and finding quality vehicles. Browse the latest listings
            below and find your next ride today!
          </p>
          <img
            src="https://thumbs.dreamstime.com/b/car-bike-duo-vintage-show-showcasing-classic-designs-retro-aesthetics-vibrant-outdoor-setting-340255496.jpg"
            alt="Vehicle showcase"
            className="w-64 h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
      <br />

      <h1 className="text-2xl font-semibold mb-4">Available Vehicles</h1>

      {loading ? (
        <p>Loading...</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="border rounded-2xl shadow-md p-4 bg-white"
            >
              <h2 className="text-xl font-semibold mb-1">{vehicle.title}</h2>
              <p className="text-sm text-gray-600 mb-1">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </p>
              <p className="text-sm text-gray-800 mb-2">
                {vehicle.description}
              </p>
              <p className="font-bold text-blue-600 mb-2">${vehicle.price}</p>
              <p className="text-xs text-gray-500">
                Seller: {vehicle.seller?.username} ({vehicle.seller?.email})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
