// src/app/components/Header.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  // Check localStorage for logged in user info on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <header className="bg-gray-100 shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Vehicle Reselling</h1>
      <nav className="space-x-4">
        {user && (
          <>
            <span>Welcome, {user.username}</span>
          </>
        )}
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Dashboard
        </Link>

        {!user && (
          <>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
        {user && (
          <>
            <Link
              href="/sell"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              Sell a Vehicle
            </Link>
            <Link
              href="/buy"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              Buy a Vehicle
            </Link>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
