import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, ShieldBan, Users, Activity, Crown, Scale, Building, Plus, BarChart2 } from "lucide-react";

// Helper: compute distribution of ratings (1–10) grouped into bands
function getRatingDistribution(reviews: any[], field: string) {
  const bands = [
    { label: "9–10", min: 9, max: 10, color: "bg-emerald-500" },
    { label: "7–8",  min: 7, max: 8,  color: "bg-green-500" },
    { label: "5–6",  min: 5, max: 6,  color: "bg-amber-500" },
    { label: "3–4",  min: 3, max: 4,  color: "bg-orange-500" },
    { label: "1–2",  min: 1, max: 2,  color: "bg-red-500" },
  ];
  const total = reviews.length;
  if (total === 0) return bands.map(b => ({ ...b, count: 0, pct: 0 }));
  return bands.map(b => {
    const count = reviews.filter(r => r[field] >= b.min && r[field] <= b.max).length;
    return { ...b, count, pct: Math.round((count / total) * 100) };
  });
}

export default async function StateDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const state = await prisma.state.findUnique({
    where: { id: resolvedParams.id },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!state) return notFound();

  const reviews = state.reviews;
  const reviewCount = reviews.length;

  const metrics = [
    { label: "Overall",    field: "rating_overall",    score: state.overall_score,    icon: BarChart2,    color: "text-indigo-400",  accent: "indigo" },
    { label: "Leadership", field: "rating_leadership",  score: state.leadership_score, icon: Crown,        color: "text-amber-400",   accent: "amber" },
    { label: "Activity",   field: "rating_activity",    score: state.activity_score,   icon: Activity,     color: "text-blue-400",    accent: "blue" },
    { label: "F2P",        field: "rating_f2p",         score: state.f2p_score,        icon: Scale,        color: "text-emerald-400", accent: "emerald" },
    { label: "Stability",  field: "rating_stability",   score: state.stability_score,  icon: Building,     color: "text-purple-400",  accent: "purple" },
    { label: "Toxicity",   field: "rating_toxicity",    score: state.toxicity_score,   icon: ShieldAlert,  color: "text-red-400",     accent: "red" },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">

      {/* State Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 blur-[100px] w-64 h-64 rounded-full pointer-events-none"></div>
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-black text-white tracking-tight">State #{state.state_number}</h1>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-lg font-bold shadow-lg ${state.overall_score >= 7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : state.overall_score >= 4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {state.overall_score >= 7 ? <ShieldCheck className="w-5 h-5" /> : <ShieldBan className="w-5 h-5" />}
              {state.overall_score.toFixed(1)} / 10
            </div>
            <span className="text-sm text-zinc-500 font-medium">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl">{state.description || "No description provided."}</p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <Link href={`/states/${state.id}/submit-review`} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-full transition-colors w-full md:w-auto shadow-lg shadow-indigo-900/50">
            <Plus className="w-5 h-5" /> Submit Intel
          </Link>
        </div>
      </div>

      {/* Rating Distribution Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" /> Rating Breakdown
          {reviewCount === 0 && <span className="text-sm font-normal text-zinc-500 ml-2">— No reviews yet</span>}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const dist = getRatingDistribution(reviews, metric.field);
            return (
              <div key={metric.label} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <span className="font-semibold text-white text-sm">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${metric.color}`}>{metric.score.toFixed(1)}</span>
                    <span className="text-zinc-600 text-sm">/10</span>
                  </div>
                </div>

                {/* Distribution Bars */}
                <div className="flex flex-col gap-2">
                  {dist.map((band) => (
                    <div key={band.label} className="flex items-center gap-3 text-xs">
                      <span className="w-8 text-zinc-500 font-medium shrink-0">{band.label}</span>
                      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${band.color}`}
                          style={{ width: `${band.pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-zinc-400 font-semibold shrink-0">
                        {reviewCount > 0 ? `${band.pct}%` : "—"}
                      </span>
                      <span className="w-6 text-right text-zinc-600 shrink-0">
                        {reviewCount > 0 ? band.count : ""}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sample size note */}
                <p className="text-xs text-zinc-600">
                  Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews Feed */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" /> Community Intel ({reviewCount})
        </h2>

        {reviewCount === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 text-zinc-500">
            No intel reports filed for this state yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-white">{review.title}</h3>
                    <div className="text-sm text-zinc-500 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-indigo-400">@{(review as any).author_name ?? review.user?.username ?? "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 font-bold text-white shrink-0">
                    {review.rating_overall}/10
                  </div>
                </div>
                <p className="text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                  {review.content}
                </p>
                {review.image_url && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group relative">
                    <a href={review.image_url} target="_blank" rel="noopener noreferrer">
                      <img src={review.image_url} alt="Evidence" className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in hover:opacity-90 transition-opacity" />
                    </a>
                  </div>
                )}
                {/* Mini score row */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-xs font-medium pt-2 border-t border-zinc-800">
                  {[
                    { label: "Leadership", val: review.rating_leadership },
                    { label: "Activity",   val: review.rating_activity },
                    { label: "F2P",        val: review.rating_f2p },
                    { label: "Stability",  val: review.rating_stability },
                    { label: "Toxicity",   val: review.rating_toxicity },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5">
                      <span className="text-zinc-500">{s.label}</span>
                      <span className={`font-bold text-sm ${s.val >= 7 ? "text-emerald-400" : s.val >= 4 ? "text-amber-400" : "text-red-400"}`}>
                        {s.val}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
