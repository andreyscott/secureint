-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "MissionDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('EMAIL', 'AUTH_LOG', 'DNS', 'FIREWALL', 'EDR', 'NETWORK', 'WEB_LOG', 'FILE', 'NOTE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'REASONING');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('VIEW_EVIDENCE', 'SEARCH_IOC', 'ASK_AI', 'SUBMIT_HYPOTHESIS', 'SUBMIT_ACTION', 'VIEW_TIMELINE', 'ANNOTATE_EVIDENCE', 'MARK_SUSPICIOUS');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "briefing" TEXT NOT NULL,
    "difficulty" "MissionDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isKey" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionObjective" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MissionObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionQuestion" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" JSONB,
    "correctData" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MissionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionSkill" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "MissionSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "investigationScore" DOUBLE PRECISION,
    "reasoningScore" DOUBLE PRECISION,
    "accuracyScore" DOUBLE PRECISION,

    CONSTRAINT "MissionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationAction" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "action" "ActionType" NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestigationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvaluation" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "misconceptions" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "investigationScore" DOUBLE PRECISION NOT NULL,
    "reasoningScore" DOUBLE PRECISION NOT NULL,
    "knowledgeScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "skillDeltas" JSONB NOT NULL,
    "nextMissionSkills" JSONB NOT NULL,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_slug_key" ON "Mission"("slug");

-- CreateIndex
CREATE INDEX "Mission_slug_idx" ON "Mission"("slug");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE INDEX "Evidence_missionId_idx" ON "Evidence"("missionId");

-- CreateIndex
CREATE INDEX "Evidence_missionId_order_idx" ON "Evidence"("missionId", "order");

-- CreateIndex
CREATE INDEX "MissionObjective_missionId_idx" ON "MissionObjective"("missionId");

-- CreateIndex
CREATE INDEX "MissionQuestion_missionId_idx" ON "MissionQuestion"("missionId");

-- CreateIndex
CREATE INDEX "MissionSkill_missionId_idx" ON "MissionSkill"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionSkill_missionId_skill_key" ON "MissionSkill"("missionId", "skill");

-- CreateIndex
CREATE INDEX "MissionAttempt_userId_idx" ON "MissionAttempt"("userId");

-- CreateIndex
CREATE INDEX "MissionAttempt_missionId_idx" ON "MissionAttempt"("missionId");

-- CreateIndex
CREATE INDEX "MissionAttempt_userId_missionId_idx" ON "MissionAttempt"("userId", "missionId");

-- CreateIndex
CREATE INDEX "MissionAttempt_status_idx" ON "MissionAttempt"("status");

-- CreateIndex
CREATE INDEX "InvestigationAction_attemptId_idx" ON "InvestigationAction"("attemptId");

-- CreateIndex
CREATE INDEX "InvestigationAction_attemptId_createdAt_idx" ON "InvestigationAction"("attemptId", "createdAt");

-- CreateIndex
CREATE INDEX "AttemptAnswer_attemptId_idx" ON "AttemptAnswer"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "AttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIEvaluation_attemptId_key" ON "AIEvaluation"("attemptId");

-- CreateIndex
CREATE INDEX "AIEvaluation_attemptId_idx" ON "AIEvaluation"("attemptId");

-- CreateIndex
CREATE INDEX "LearnerSkill_userId_idx" ON "LearnerSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerSkill_userId_skill_key" ON "LearnerSkill"("userId", "skill");

-- CreateIndex
CREATE INDEX "AIMessage_userId_idx" ON "AIMessage"("userId");

-- CreateIndex
CREATE INDEX "AIMessage_attemptId_idx" ON "AIMessage"("attemptId");

-- CreateIndex
CREATE INDEX "AIMessage_attemptId_createdAt_idx" ON "AIMessage"("attemptId", "createdAt");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionObjective" ADD CONSTRAINT "MissionObjective_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionQuestion" ADD CONSTRAINT "MissionQuestion_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSkill" ADD CONSTRAINT "MissionSkill_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAttempt" ADD CONSTRAINT "MissionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAttempt" ADD CONSTRAINT "MissionAttempt_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationAction" ADD CONSTRAINT "InvestigationAction_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MissionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MissionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MissionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvaluation" ADD CONSTRAINT "AIEvaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MissionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerSkill" ADD CONSTRAINT "LearnerSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MissionAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
