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
  const buttonClasses =
    "inline-block px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors duration-200 hover:bg-blue-700";

  return (
    <header className="bg-gray-100 shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Vehicle Reselling</h1>
      <nav className="space-x-4">
        {user && (
          <span className="mr-4 text-gray-700">Welcome, {user.username}</span>
        )}
        <Link href="/" className={buttonClasses}>
          Home
        </Link>

        {!user && (
          <>
            <Link href="/login" className={buttonClasses}>
              Login
            </Link>
            <Link href="/register" className={buttonClasses}>
              Register
            </Link>
          </>
        )}
        {user && (
          <>
            <Link href="/sell" className={buttonClasses}>
              Sell a Vehicle
            </Link>
            <Link href="/buy" className={buttonClasses}>
              Buy a Vehicle
            </Link>
            <Link href="/dashboard" className={buttonClasses}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className={buttonClasses}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
