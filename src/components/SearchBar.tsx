"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(query);
    if (!query || isNaN(num)) return;

    if (num < 1 || num > 4500) {
      setError("State number must be between 1 and 4500.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/states/search?state_number=${num}`);
      if (res.ok) {
        const data = await res.json();
        router.push(`/states/${data.stateId}`);
      } else {
        setError("State not found. It may not have been added yet.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mt-6 flex flex-col items-center gap-2">
      <form onSubmit={handleSearch} className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800 shadow-2xl">
          <Search className="w-5 h-5 text-zinc-500 ml-4 mr-2 shrink-0" />
          <input
            type="number"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(""); }}
            placeholder="Enter state number (1 – 4500)..."
            min="1"
            max="4500"
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none px-2 py-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>
      </form>
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
