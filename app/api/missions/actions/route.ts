import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/helpers";
import { recordAction } from "@/lib/mission/engine";
import { recordActionSchema } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser();

    const body = await req.json();
    const parsed = recordActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid action data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { attemptId, action, targetId, metadata } = parsed.data;

    await recordAction(
      user.id,
      attemptId,
      action as import("@/app/generated/prisma").ActionType,
      targetId,
      metadata as Record<string, unknown> | undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Action recording error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to record action" },
      { status: 500 }
    );
  }
}
