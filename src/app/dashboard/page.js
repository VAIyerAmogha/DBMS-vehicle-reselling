"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState(""); // For accept/reject errors & vehicle actions
  const [actionSuccess, setActionSuccess] = useState(""); // For success messages
  const [processingOfferId, setProcessingOfferId] = useState(null); // For offers
  const [processingVehicleId, setProcessingVehicleId] = useState(null); // For delete/update vehicle

  // Inline edit states for vehicles
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    make: "",
    model: "",
    year: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    async function fetchData() {
      setLoading(true);
      setError("");
      setActionError("");
      setActionSuccess("");

      try {
        const vehiclesRes = await fetch(
          "/api/vehicles?sellerId=" + parsedUser.id
        );
        if (!vehiclesRes.ok) throw new Error("Failed to fetch vehicles");
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);

        const offersRes = await fetch(`/api/offers/recieved/${parsedUser.id}`);
        if (!offersRes.ok) throw new Error("Failed to fetch offers");
        const offersData = await offersRes.json();
        setOffers(offersData);

        const transactionsRes = await fetch(
          `/api/transactions/${parsedUser.id}`
        );
        if (!transactionsRes.ok)
          throw new Error("Failed to fetch transactions");
        const transactionsData = await transactionsRes.json();
        console.log(transactionsData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleOfferAction(offerId, action) {
    setActionError("");
    setActionSuccess("");
    setProcessingOfferId(offerId);

    try {
      let url = "";
      if (action === "accept") {
        url = "/api/offers/accept";
      } else if (action === "reject") {
        url = "/api/offers/reject";
      } else {
        setActionError("Unknown action");
        setProcessingOfferId(null);
        return;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || `Failed to ${action} offer`);
        setProcessingOfferId(null);
        return;
      }

      setActionSuccess(`Offer ${action}ed successfully.`);

      // Update offers list locally without full refresh
      setOffers((prevOffers) =>
        prevOffers.map((offer) => {
          if (offer.id === offerId) {
            return {
              ...offer,
              status: action === "accept" ? "accepted" : "rejected",
            };
          }
          if (
            action === "accept" &&
            offer.vehicleId ===
              prevOffers.find((o) => o.id === offerId)?.vehicleId &&
            offer.id !== offerId
          ) {
            return { ...offer, status: "rejected" };
          }
          return offer;
        })
      );

      // Also update vehicle status if accepted
      if (action === "accept") {
        setVehicles((prevVehicles) =>
          prevVehicles.map((v) =>
            v.id === offers.find((o) => o.id === offerId)?.vehicleId
              ? { ...v, status: "sold" }
              : v
          )
        );
      }
    } catch (err) {
      setActionError(`Failed to ${action} offer`);
    }
    setProcessingOfferId(null);
  }

  // --- Vehicle Delete handler ---
  async function handleDeleteVehicle(vehicleId) {
    if (!confirm("Are you sure you want to delete this vehicle listing?"))
      return;

    setActionError("");
    setActionSuccess("");
    setProcessingVehicleId(vehicleId);

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to delete vehicle");
        setProcessingVehicleId(null);
        return;
      }

      setActionSuccess("Vehicle deleted successfully.");
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      if (editingVehicleId === vehicleId) setEditingVehicleId(null);
    } catch (err) {
      setActionError("Failed to delete vehicle");
    }
    setProcessingVehicleId(null);
  }

  // --- Start editing a vehicle ---
  function startEditVehicle(vehicle) {
    setEditingVehicleId(vehicle.id);
    setEditFormData({
      title: vehicle.title,
      description: vehicle.description,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      price: vehicle.price.toString(),
      status: vehicle.status,
    });
    setActionError("");
    setActionSuccess("");
  }

  // --- Cancel editing ---
  function cancelEdit() {
    setEditingVehicleId(null);
    setActionError("");
    setActionSuccess("");
  }

  // --- Handle input changes in edit form ---
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // --- Save edited vehicle ---
  async function saveEditedVehicle(vehicleId) {
    setActionError("");
    setActionSuccess("");
    setProcessingVehicleId(vehicleId);

    // Basic validation
    const { title, description, make, model, year, price, status } =
      editFormData;
    if (!title || !description || !make || !model || !year || !price) {
      setActionError("Please fill all required fields.");
      setProcessingVehicleId(null);
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          make,
          model,
          year,
          price,
          status,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to update vehicle");
        setProcessingVehicleId(null);
        return;
      }

      setActionSuccess("Vehicle updated successfully.");

      // Update vehicles locally
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => (v.id === vehicleId ? data.vehicle : v))
      );
      setEditingVehicleId(null);
    } catch (err) {
      setActionError("Failed to update vehicle");
    }
    setProcessingVehicleId(null);
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>

        {/* Show action messages */}
        {actionError && <p className="text-red-600 mb-4">{actionError}</p>}
        {actionSuccess && (
          <p className="text-green-600 mb-4">{actionSuccess}</p>
        )}

        {/* User's Vehicle Listings */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Your Vehicle Listings</h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-500">You have no vehicle listings.</p>
          ) : (
            <ul className="space-y-4">
              {vehicles.map((v) => (
                <li
                  key={v.id}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  {editingVehicleId === v.id ? (
                    <>
                      {/* Editable form */}
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditChange}
                        className="mb-1 w-full border px-2 py-1 rounded"
                        placeholder="Title"
                      />
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        className="mb-1 w-full border px-2 py-1 rounded"
                        placeholder="Description"
                        rows={2}
                      />
                      <div className="grid grid-cols-3 gap-2 mb-1">
                        <input
                          type="text"
                          name="make"
                          value={editFormData.make}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded"
                          placeholder="Make"
                        />
                        <input
                          type="text"
                          name="model"
                          value={editFormData.model}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded"
                          placeholder="Model"
                        />
                        <input
                          type="number"
                          name="year"
                          value={editFormData.year}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded"
                          placeholder="Year"
                          min="1900"
                          max="2100"
                        />
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        className="mb-1 w-full border px-2 py-1 rounded"
                        placeholder="Price"
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        className="mb-1 w-full border px-2 py-1 rounded"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                      </select>

                      <div className="space-x-2">
                        <button
                          onClick={() => saveEditedVehicle(v.id)}
                          disabled={processingVehicleId === v.id}
                          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={processingVehicleId === v.id}
                          className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Display vehicle info */}
                      <p className="font-semibold">{v.title}</p>
                      <p className="text-sm text-gray-600">
                        {v.make} {v.model} - {v.year}
                      </p>
                      <p className="text-gray-700">${v.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Status: {v.status}
                      </p>

                      {/* Edit/Delete buttons */}
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => startEditVehicle(v)}
                          className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v.id)}
                          disabled={processingVehicleId === v.id}
                          className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Offers received */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Offers Received</h2>
          {offers.length === 0 ? (
            <p className="text-gray-500">
              No offers received on your vehicles.
            </p>
          ) : (
            <ul className="space-y-4">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <p>
                    <span className="font-semibold">Vehicle:</span>{" "}
                    {offer.vehicle.title} ({offer.vehicle.make}{" "}
                    {offer.vehicle.model})
                  </p>
                  <p>
                    <span className="font-semibold">Buyer:</span>{" "}
                    {offer.buyer.username}
                  </p>
                  <p>
                    <span className="font-semibold">Amount:</span> $
                    {offer.amount.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {offer.status}
                  </p>

                  {offer.status === "pending" && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleOfferAction(offer.id, "accept")}
                        disabled={processingOfferId === offer.id}
                        className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleOfferAction(offer.id, "reject")}
                        disabled={processingOfferId === offer.id}
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Transactions */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Your Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found.</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <p>
                    <span className="font-semibold">Vehicle:</span>{" "}
                    {tx.vehicle.title} ({tx.vehicle.make} {tx.vehicle.model})
                  </p>
                  <p>
                    <span className="font-semibold">Price:</span> $
                    {tx.amount.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Buyer:</span>{" "}
                    {tx.buyer.username} ({tx.buyer.email})
                  </p>
                  <p>
                    <span className="font-semibold">Seller:</span>{" "}
                    {tx.vehicle.seller
                      ? tx.vehicle.seller.username
                      : "Unknown Seller"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
