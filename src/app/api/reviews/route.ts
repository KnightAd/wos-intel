import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      state_id, title, content,
      rating_overall, rating_leadership, rating_activity, rating_toxicity, rating_stability,
      author_name, image_url
    } = data;

    if (!state_id || !title || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Get user IP for deduplication
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // Check if this IP already reviewed this state
    const existing = await prisma.review.findFirst({
      where: {
        state_id,
        author_ip: ip
      }
    });

    if (existing) {
      return NextResponse.json({ 
        message: "You have already submitted an intel report for this state." 
      }, { status: 403 });
    }


    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          user_id: null,
          state_id,
          title,
          content,
          rating_overall,
          rating_leadership,
          rating_activity,
          rating_toxicity,
          rating_stability,
          author_name: author_name || "Anonymous",
          author_ip: ip,
          image_url: image_url || null,
        },
      });

      const allReviews = await tx.review.findMany({ where: { state_id } });
      const count = allReviews.length;
      const avg = (field: keyof typeof allReviews[0]) =>
        allReviews.reduce((acc, curr) => acc + (curr[field] as number), 0) / count;

      await tx.state.update({
        where: { id: state_id },
        data: {
          overall_score: avg("rating_overall"),
          leadership_score: avg("rating_leadership"),
          activity_score: avg("rating_activity"),
          toxicity_score: avg("rating_toxicity"),
          stability_score: avg("rating_stability"),
        },
      });

      return review;
    });

    // Clear cache so the new review shows up instantly
    revalidatePath("/");
    revalidatePath(`/states/${state_id}`);

    return NextResponse.json({ message: "Review created successfully", review: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
