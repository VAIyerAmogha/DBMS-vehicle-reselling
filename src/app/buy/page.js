"use client";

import React, { useState, useEffect } from "react";

export default function BuyPage() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerVehicleId, setOfferVehicleId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    }
    fetchVehicles();
  }, []);

  // Filter vehicles excluding user's own and by search term
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.sellerId !== user?.id &&
      `${v.make} ${v.model} ${v.title}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  async function handleMakeOffer(vehicleId) {
    if (!offerAmount || isNaN(offerAmount) || Number(offerAmount) <= 0) {
      setMessage("Please enter a valid offer amount.");
      return;
    }

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(offerAmount),
          vehicleId,
          buyerId: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Offer made successfully.");
        setOfferVehicleId(null);
        setOfferAmount("");
      } else {
        setMessage(data.error || "Failed to make offer.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Buy Vehicles</h1>

      <input
        type="text"
        placeholder="Search vehicles..."
        className="mb-6 p-2 border border-gray-300 rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredVehicles.length === 0 && (
        <p>No vehicles found matching your search.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              {v.make} {v.model} - {v.title}
            </h2>
            <p className="mb-1">Year: {v.year}</p>
            <p className="mb-1">Price: ${v.price}</p>
            <p className="mb-1">Description: {v.description}</p>
            <p className="mb-2 text-sm text-gray-600">
              Seller: {v.seller.username} ({v.seller.email})
            </p>

            {offerVehicleId === v.id ? (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Enter your offer"
                  className="p-2 border border-gray-400 rounded w-full mb-2"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
                <button
                  onClick={() => handleMakeOffer(v.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit Offer
                </button>
                <button
                  onClick={() => {
                    setOfferVehicleId(null);
                    setOfferAmount("");
                    setMessage("");
                  }}
                  className="ml-2 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOfferVehicleId(v.id);
                  setOfferAmount("");
                  setMessage("");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Make Offer
              </button>
            )}
          </div>
        ))}
      </div>

      {message && (
        <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
