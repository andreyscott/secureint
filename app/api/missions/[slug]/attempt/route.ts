import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/helpers";
import { startOrResumeAttempt } from "@/lib/mission/engine";
import { z } from "zod";

const schema = z.object({
  slug: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireDbUser();
    const { slug } = await params;

    parsed: {
      const parsed = schema.safeParse({ slug });
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      }
    }

    const { attemptId, isNew } = await startOrResumeAttempt(user.id, slug);

    return NextResponse.json({ attemptId, isNew });
  } catch (error) {
    console.error("Attempt API error:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Mission not found")) {
        return NextResponse.json({ error: "Mission not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to start attempt" },
      { status: 500 }
    );
  }
}
