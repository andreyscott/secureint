import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/helpers";
import { runSocraticTutor } from "@/lib/ai/tutor";
import { tutorRequestSchema } from "@/lib/ai/schemas";

// Simple in-memory rate limiter (upgrade to Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;

  const existing = rateLimitMap.get(userId);
  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= maxRequests) return false;

  existing.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser();

    // Rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = tutorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, attemptId, missionSlug } = parsed.data;

    const response = await runSocraticTutor({
      userId: user.id,
      attemptId,
      userMessage: message,
      missionSlug,
    });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Tutor API error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
