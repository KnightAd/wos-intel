"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, UploadCloud, Send } from "lucide-react";

export default function SubmitReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image is too large. Please keep it under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    rating_overall: 5,
    rating_leadership: 5,
    rating_activity: 5,
    rating_f2p: 5,
    rating_toxicity: 5,
    rating_stability: 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.startsWith("rating") ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state_id: id,
          author_name: authorName || "Anonymous",
          image_url: image,
          ...formData
        }),
      });

      if (res.ok) {
        router.push(`/states/${id}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
          Submit Intel Report
        </h1>
        <p className="text-zinc-400">Your report helps others make informed transfer decisions. Please provide accurate and truthful information.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Report Details</h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Your Name / IGN <span className="text-zinc-500">(optional)</span></label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="Anonymous"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Report Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="e.g. Toxic leadership, but great f2p activity"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Detailed Intel</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              placeholder="Describe the state's political climate, whale behavior, alliance structures, etc."
            ></textarea>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">State Metrics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { id: "rating_overall", label: "Overall Rating (1-10)" },
              { id: "rating_leadership", label: "Leadership Quality (1-10)" },
              { id: "rating_activity", label: "Activity Level (1-10)" },
              { id: "rating_f2p", label: "F2P Friendliness (1-10)" },
              { id: "rating_toxicity", label: "Toxicity Level (1-10, lower is better)" },
              { id: "rating_stability", label: "State Stability (1-10)" },
            ].map(metric => (
              <div key={metric.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-300">{metric.label}</label>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                    {(formData as any)[metric.id]}
                  </span>
                </div>
                <input
                  type="range"
                  name={metric.id}
                  min="1"
                  max="10"
                  value={(formData as any)[metric.id]}
                  onChange={handleChange}
                  className="w-full accent-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white">Evidence Upload</h2>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Optional</span>
          </div>
          <p className="text-sm text-zinc-400">Upload screenshots of state chat, world chat, or battle reports to increase the credibility of your intel.</p>

          {!image ? (
            <label className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 transition-colors rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-zinc-950 cursor-pointer">
              <UploadCloud className="w-12 h-12 text-zinc-600" />
              <div className="text-center">
                <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
                <p className="text-xs text-zinc-500 mt-1">PNG, JPG, JPEG up to 2MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950">
              <img src={image} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <ShieldAlert className="w-5 h-5 rotate-180" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  );
}
