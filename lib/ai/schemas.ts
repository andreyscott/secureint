import { z } from "zod";

// ============================================================
// AI EVALUATION OUTPUT SCHEMA
// ============================================================

export const skillDeltaSchema = z.object({
  name: z.string(),
  masteryDelta: z.number().min(-1).max(1),
});

export const aiEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  investigationScore: z.number().min(0).max(100),
  reasoningScore: z.number().min(0).max(100),
  knowledgeScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  misconceptions: z.array(z.string()),
  recommendations: z.array(z.string()),
  skills: z.array(skillDeltaSchema),
  nextMissionSkills: z.array(z.string()),
  summary: z.string(),
});

export type AIEvaluationResult = z.infer<typeof aiEvaluationSchema>;
export type SkillDelta = z.infer<typeof skillDeltaSchema>;

// ============================================================
// TUTOR MESSAGE SCHEMA
// ============================================================

export const tutorMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const tutorRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  attemptId: z.string().min(1),
  missionSlug: z.string(),
});

export const tutorResponseSchema = z.object({
  message: z.string(),
  suggestedNextActions: z.array(z.string()).optional(),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;

// ============================================================
// INVESTIGATION ACTION SCHEMA
// ============================================================

export const recordActionSchema = z.object({
  attemptId: z.string().min(1),
  action: z.enum([
    "VIEW_EVIDENCE",
    "SEARCH_IOC",
    "ASK_AI",
    "SUBMIT_HYPOTHESIS",
    "SUBMIT_ACTION",
    "VIEW_TIMELINE",
    "ANNOTATE_EVIDENCE",
    "MARK_SUSPICIOUS",
  ]),
  targetId: z.string().optional(),
  // Zod v4: z.record requires key schema + value schema
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RecordActionInput = z.infer<typeof recordActionSchema>;

// ============================================================
// MISSION SUBMISSION SCHEMA
// ============================================================

export const missionSubmissionSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]),
      reasoning: z.string().optional(),
    })
  ),
  finalReasoning: z.string().min(10).max(5000),
  attackVector: z.string().min(1).max(500),
  recommendedResponse: z.string().min(10).max(5000),
});

export type MissionSubmission = z.infer<typeof missionSubmissionSchema>;

// ============================================================
// RECOMMENDATION SCHEMA
// ============================================================

export const recommendationSchema = z.object({
  missionSlug: z.string(),
  missionTitle: z.string(),
  reason: z.string(),
  targetSkill: z.string(),
  urgency: z.enum(["low", "medium", "high"]),
});

export type MissionRecommendation = z.infer<typeof recommendationSchema>;
