import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldAlert, ArrowRight, ShieldCheck, ShieldBan } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export default async function Home() {
  const states = await prisma.state.findMany({
    where: {
      reviews: { some: {} }, // only states with at least 1 review
    },
    orderBy: { overall_score: "desc" },
    take: 50,
    include: {
      _count: { select: { reviews: true } },
    },
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      {/* Hero Section */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 md:p-12 lg:p-16 flex flex-col items-center text-center gap-6">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-3xl">

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Know Before You <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Transfer</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            The premium state reputation platform for Whiteout Survival. Explore leadership quality, detect toxic behavior, and verify transfer claims with community evidence.
          </p>
          
          <SearchBar />
        </div>
      </section>

      {/* State List */}
      <section className="flex flex-col gap-6 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            State Intel Reports
            {states.length > 0 && <span className="text-sm font-normal text-zinc-500 ml-2">({states.length} active states)</span>}
          </h2>
          <div className="flex gap-2">
            <select className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>Highest Score</option>
              <option>Most Active</option>
              <option>Lowest Toxicity</option>
            </select>
          </div>
        </div>

        {states.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 text-zinc-500">
            <p className="text-lg font-semibold text-zinc-400 mb-2">No reviews yet</p>
            <p className="text-sm">Search for your state above and be the first to submit intel!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {states.map((state) => (
              <Link href={`/states/${state.id}`} key={state.id} className="group flex flex-col bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-900/20">
                <div className="p-6 flex flex-col gap-4 border-b border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">State</span>
                      <span className="text-3xl font-black text-white">#{state.state_number}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold ${state.overall_score >= 7 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : state.overall_score >= 4 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {state.overall_score >= 7 ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                      {state.overall_score.toFixed(1)} / 10
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {state.description || "No description provided. Click to view community intel."}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">{(state as any)._count?.reviews ?? 0} reviews</p>
                </div>
                <div className="p-4 bg-zinc-950/50 grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Leadership</span>
                    <span className="text-zinc-200">{state.leadership_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Toxicity</span>
                    <span className="text-zinc-200">{state.toxicity_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Activity</span>
                    <span className="text-zinc-200">{state.activity_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Stability</span>
                    <span className="text-zinc-200">{state.stability_score.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-sm text-indigo-400 font-medium group-hover:text-white transition-colors border-t border-zinc-800">
                  View Full Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
