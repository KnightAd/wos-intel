"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus } from "lucide-react";

export default function AddState() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stateNumber, setStateNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state_number: stateNumber, description }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/states/${data.state.id}`);
        router.refresh();
      } else {
        if (data.stateId) {
          router.push(`/states/${data.stateId}`);
        } else {
          setError(data.message || "Failed to add state");
        }
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
          Register New State
        </h1>
        <p className="text-zinc-400">Can't find your state? Add it to the intel network so the community can start submitting reports.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 blur-[80px] w-48 h-48 rounded-full pointer-events-none"></div>

        <div className="flex flex-col gap-2 relative z-10">
          <label className="text-sm font-medium text-zinc-300">State Number</label>
          <input
            type="number"
            value={stateNumber}
            onChange={(e) => setStateNumber(e.target.value)}
            required
            min="1"
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xl font-black"
            placeholder="e.g. 153"
          />
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <label className="text-sm font-medium text-zinc-300">Initial Description <span className="text-zinc-500">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            placeholder="Provide a brief context about this state..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 mt-4 relative z-10">
          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto shadow-lg shadow-indigo-900/50">
            {loading ? "Registering..." : <><Plus className="w-5 h-5" /> Register State</>}
          </button>
        </div>
      </form>
    </div>
  );
}
