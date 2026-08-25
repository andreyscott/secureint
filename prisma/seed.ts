import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";
import { ALL_MISSIONS } from "../lib/mission/data/missions";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/cyberquest",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding CyberQuest AI database...");

  // ============================================================
  // CLEAN EXISTING DATA
  // ============================================================
  console.log("🧹 Cleaning existing data...");
  await prisma.aIMessage.deleteMany();
  await prisma.aIEvaluation.deleteMany();
  await prisma.attemptAnswer.deleteMany();
  await prisma.investigationAction.deleteMany();
  await prisma.missionAttempt.deleteMany();
  await prisma.learnerSkill.deleteMany();
  await prisma.missionSkill.deleteMany();
  await prisma.missionQuestion.deleteMany();
  await prisma.missionObjective.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // CREATE DEMO USER
  // ============================================================
  console.log("👤 Creating demo user...");
  const demoUser = await prisma.user.create({
    data: {
      clerkId: "demo_clerk_id_placeholder",
      email: "demo@cyberquest.ai",
      name: "Alex Chen",
      role: "STUDENT",
    },
  });

  // Create realistic skill profile for demo user
  const demoSkills = [
    { skill: "phishing", mastery: 0.86, confidence: 0.8, attempts: 4 },
    { skill: "credential_theft", mastery: 0.65, confidence: 0.6, attempts: 2 },
    { skill: "authentication", mastery: 0.41, confidence: 0.4, attempts: 3 },
    { skill: "authorization", mastery: 0.55, confidence: 0.5, attempts: 2 },
    { skill: "networking", mastery: 0.73, confidence: 0.7, attempts: 3 },
    { skill: "ioc_analysis", mastery: 0.73, confidence: 0.65, attempts: 3 },
    { skill: "incident_response", mastery: 0.55, confidence: 0.5, attempts: 2 },
    { skill: "web_security", mastery: 0.62, confidence: 0.6, attempts: 2 },
    { skill: "cryptography", mastery: 0.38, confidence: 0.3, attempts: 1 },
  ];

  await prisma.learnerSkill.createMany({
    data: demoSkills.map((s) => ({ userId: demoUser.id, ...s })),
  });

  // ============================================================
  // CREATE INSTRUCTOR USER
  // ============================================================
  const instructor = await prisma.user.create({
    data: {
      clerkId: "instructor_clerk_id_placeholder",
      email: "instructor@cyberquest.ai",
      name: "Dr. Sarah Kim",
      role: "INSTRUCTOR",
    },
  });
  console.log("👩‍🏫 Created instructor:", instructor.email);

  // ============================================================
  // CREATE MISSIONS
  // ============================================================
  console.log("🎯 Creating missions...");

  for (const missionData of ALL_MISSIONS) {
    const mission = await prisma.mission.create({
      data: {
        slug: missionData.slug,
        title: missionData.title,
        description: missionData.description,
        briefing: missionData.briefing,
        difficulty: missionData.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        status: missionData.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        order: missionData.order,
      },
    });

    // Create objectives
    if (missionData.objectives.length > 0) {
      await prisma.missionObjective.createMany({
        data: missionData.objectives.map((obj) => ({
          missionId: mission.id,
          skill: obj.skill,
          description: obj.description,
          weight: obj.weight,
          order: obj.order,
        })),
      });
    }

    // Create skills
    if (missionData.skills.length > 0) {
      await prisma.missionSkill.createMany({
        data: missionData.skills.map((s) => ({
          missionId: mission.id,
          skill: s.skill,
          weight: s.weight,
        })),
      });
    }

    // Create evidence
    if (missionData.evidence.length > 0) {
      await prisma.evidence.createMany({
        data: missionData.evidence.map((e) => ({
          missionId: mission.id,
          type: e.type as
            | "EMAIL"
            | "AUTH_LOG"
            | "DNS"
            | "FIREWALL"
            | "EDR"
            | "NETWORK"
            | "WEB_LOG"
            | "FILE"
            | "NOTE",
          title: e.title,
          description: e.description,
          content: e.content,
          order: e.order,
          isKey: e.isKey,
        })),
      });
    }

    // Create questions
    if (missionData.questions.length > 0) {
      await prisma.missionQuestion.createMany({
        data: missionData.questions.map((q) => ({
          missionId: mission.id,
          question: q.question,
          type: q.type as "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "REASONING",
          options: q.options ?? null,
          correctData: q.correctData,
          explanation: q.explanation,
          order: q.order,
        })),
      });
    }

    console.log(`  ✅ Created mission: ${mission.title}`);
  }

  // ============================================================
  // CREATE A SAMPLE COMPLETED ATTEMPT FOR THE DEMO USER
  // (So the dashboard shows past activity)
  // ============================================================
  console.log("📊 Creating sample completed attempt...");

  const firstMission = await prisma.mission.findFirst({
    where: { slug: "compromised-employee" },
  });

  if (firstMission) {
    const sampleAttempt = await prisma.missionAttempt.create({
      data: {
        userId: demoUser.id,
        missionId: firstMission.id,
        startedAt: new Date("2024-03-14T14:00:00Z"),
        completedAt: new Date("2024-03-14T14:32:00Z"),
        status: "COMPLETED",
        score: 72,
        investigationScore: 80,
        reasoningScore: 65,
        accuracyScore: 70,
      },
    });

    // Create sample AI evaluation for the previous attempt
    await prisma.aIEvaluation.create({
      data: {
        attemptId: sampleAttempt.id,
        summary:
          "Good initial investigation that correctly identified the phishing vector, but reasoning on the post-compromise activity had gaps — particularly around the email forwarding rule significance.",
        strengths: [
          "Correctly identified the phishing email as the initial vector",
          "Noted the impossible travel indicator in authentication logs",
          "Recognized the suspicious sender domain (micros0ft-support.example)",
        ],
        weaknesses: [
          "Did not examine the DNS evidence before the authentication logs",
          "Missed the significance of the email forwarding rule creation",
        ],
        misconceptions: [
          "Associated the unusual Romanian login with a potential VPN or business travel scenario rather than credential compromise",
        ],
        recommendations: [
          "Study authentication anomaly patterns and impossible travel detection",
          "Review email forwarding rules as a common persistence mechanism",
          "Practice correlating DNS evidence with credential theft incidents",
        ],
        investigationScore: 80,
        reasoningScore: 65,
        knowledgeScore: 70,
        overallScore: 72,
        skillDeltas: [
          { name: "phishing", masteryDelta: 0.05 },
          { name: "credential_theft", masteryDelta: -0.05 },
          { name: "authentication", masteryDelta: -0.1 },
        ],
        nextMissionSkills: ["authentication", "credential_theft"],
      },
    });
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Demo user ID: ${demoUser.id}`);
  console.log("   Email: demo@cyberquest.ai");
  console.log("\n📝 Next steps:");
  console.log("   1. Set DATABASE_URL in .env");
  console.log("   2. Run: npx prisma migrate dev --name init");
  console.log("   3. Run: npx prisma db seed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
