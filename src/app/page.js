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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Welcome to Vehicle Reselling
        </h1>
        <p className="text-gray-700">
          This is a test page to verify Tailwind CSS is working correctly.
        </p>
      </div>
      <br></br>

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
