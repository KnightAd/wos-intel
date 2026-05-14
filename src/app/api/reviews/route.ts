import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      state_id, title, content,
      rating_overall, rating_leadership, rating_activity, rating_f2p, rating_toxicity, rating_stability,
      author_name
    } = data;

    if (!state_id || !title || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
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
          rating_f2p,
          rating_toxicity,
          rating_stability,
          author_name: author_name || "Anonymous",
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
          f2p_score: avg("rating_f2p"),
          toxicity_score: avg("rating_toxicity"),
          stability_score: avg("rating_stability"),
        },
      });

      return review;
    });

    return NextResponse.json({ message: "Review created successfully", review: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
