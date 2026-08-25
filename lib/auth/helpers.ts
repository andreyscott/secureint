import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Get or create a user in the database based on Clerk authentication.
 * Returns the database user record.
 */
export async function getOrCreateDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkId}@unknown.com`;
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;

  // Upsert user — create on first auth, update on subsequent
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name,
    },
    create: {
      clerkId,
      email,
      name,
      role: "STUDENT",
    },
  });

  return user;
}

/**
 * Get the authenticated database user. Throws if not authenticated.
 */
export async function requireDbUser() {
  const user = await getOrCreateDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Get the authenticated user's ID (from our DB). Returns null if not auth.
 */
export async function getDbUserId(): Promise<string | null> {
  const user = await getOrCreateDbUser();
  return user?.id ?? null;
}
