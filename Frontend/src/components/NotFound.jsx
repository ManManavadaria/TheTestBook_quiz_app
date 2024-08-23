import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 dark:text-white text-black px-4">
      <h1 className="text-6xl font-extrabold mb-4 text-center md:text-8xl">404</h1>
      <p className="text-xl md:text-2xl mb-6 text-center">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="text-lg md:text-xl bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
