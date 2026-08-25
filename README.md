# CyberQuest AI

**"Learn cybersecurity by investigating, not memorizing."**

CyberQuest AI is an adaptive cybersecurity learning platform that places learners inside realistic simulated cybersecurity incidents. Instead of static courses and multiple-choice quizzes, learners investigate real evidence — suspicious emails, authentication logs, DNS records, firewall logs, and EDR alerts — and must determine what happened, explain their reasoning, and choose an appropriate response.

## 🎯 The Problem

Traditional cybersecurity training teaches through lectures and quizzes. You can memorize the definition of a phishing attack without ever being able to detect one in practice. Real security analysts don't memorize — they investigate. CyberQuest trains that investigative muscle.

## 💡 The Solution

CyberQuest's core learning loop:

```
Scenario → Investigation → Reasoning → AI Evaluation
→ Misconception Detection → Skill Update → Personalized Next Mission
```

The AI is core to the product:
- **AI Socratic Tutor**: Guides reasoning without revealing answers
- **AI Evaluator**: Analyzes investigation process, detects misconceptions, updates skill profile
- **Hybrid Recommender**: Deterministic skill-gap detection + AI to recommend the right next mission

## 🏗 Architecture

```
app/
├── (app)/                    # Authenticated app routes
│   ├── dashboard/            # Learner dashboard
│   ├── missions/             # Mission library + briefing + investigation + results
│   ├── profile/              # Skill profile with radar chart
│   └── instructor/           # Instructor analytics
├── api/
│   ├── ai/tutor/             # Socratic tutor endpoint (rate-limited)
│   ├── ai/evaluate/          # Post-mission AI evaluation
│   ├── missions/             # Attempt management + action recording
│   └── profile/              # Profile data
├── sign-in/ & sign-up/       # Clerk auth pages
└── page.tsx                  # Landing page

lib/
├── ai/
│   ├── tutor.ts              # Socratic tutor service (Gemini)
│   ├── evaluator.ts          # Mission evaluator service (Gemini + Zod)
│   ├── recommender.ts        # Hybrid recommendation engine
│   ├── prompts.ts            # System prompts + context builders
│   └── schemas.ts            # Zod validation schemas
├── mission/
│   ├── engine.ts             # Server-side mission logic
│   └── data/missions.ts      # Full mission dataset
├── db/prisma.ts              # Prisma singleton
└── auth/helpers.ts           # Clerk → DB user bridge

components/
└── investigation/
    ├── InvestigationWorkspace.tsx  # Full investigation UI (client)
    └── EvidenceViewer.tsx          # Evidence-type renderers
```

## 🤖 AI Architecture

The AI is split into three separate services — not one giant prompt:

### Socratic Tutor (`lib/ai/tutor.ts`)
- Loaded server-side with full mission context, learner skill profile, and conversation history
- Uses Gemini 2.0 Flash with a Socratic system prompt
- **Never reveals the answer** — only asks guiding questions
- Rate limited (20 requests/minute per user)

### Evaluator (`lib/ai/evaluator.ts`)
- Runs after mission submission
- Analyzes: evidence viewed, inspection order, written reasoning, answers, attack vector, recommended response
- Uses Gemini with `responseMimeType: "application/json"` for structured output
- Output validated with Zod — never blindly trusted
- Detects specific misconceptions (e.g., "confused credential theft with malware execution")

### Recommender (`lib/ai/recommender.ts`)
- **Deterministic first**: finds weakest skill with `prisma.learnerSkill.findMany({ orderBy: { mastery: "asc" } })`
- Then finds a published mission targeting that skill
- No LLM for sorting logic — only for generating the human-readable reason

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | Clerk |
| AI | Google Gemini 2.0 Flash |
| Validation | Zod |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted)
- Clerk account
- Google AI Studio API key (Gemini)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd cyberquest-ai

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

### Environment Variables

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cyberquest?schema=public"

# Clerk (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Gemini (from aistudio.google.com)
GEMINI_API_KEY=...
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌱 Seed Data

The seed creates:
- **Demo student** (`demo@cyberquest.ai`) with a realistic skill profile
- **Demo instructor** (`instructor@cyberquest.ai`)
- **Mission 01**: "The Compromised Employee" (fully playable)
  - 5 evidence pieces: phishing email, auth logs, DNS records, EDR alert, firewall logs
  - 4 multiple-choice questions
  - 5 investigation objectives
- **Missions 02-03**: Placeholder missions (published but evidence TBD)

## 📖 Hackathon Demo Flow

1. **Landing page** → "Start Your First Mission"
2. **Sign up/in** → redirect to dashboard
3. **Dashboard** → see skill profile, AI recommendation, featured mission
4. **Mission 01 briefing** → "The Compromised Employee"
5. **Investigation workspace** → inspect phishing email, auth logs, DNS, EDR, firewall
6. **Ask AI tutor** → "What should I look for in the email headers?"
7. **Submit findings** → make a deliberate mistake (choose "malware" as attack vector)
8. **AI evaluates** → detects misconception: "You confused credential theft with malware execution"
9. **Results page** → misconception callout, skill update, next mission recommendation
10. **Profile page** → updated radar chart, authentication skill flagged as weak

## 🔒 Security Model

- All AI calls server-side only
- Clerk handles authentication; every API route validates session
- Zod validates all API inputs
- Scores calculated server-side — client cannot report its own score
- No API keys in client bundles
- Rate limiting on AI endpoints
- Correct answers never sent to client
- No real attack infrastructure referenced

## 🗺 Future Roadmap

- [ ] Real-time collaboration (two analysts per incident)
- [ ] More mission types: ransomware, insider threat, cloud breach
- [ ] Detailed evidence annotations
- [ ] Certification paths
- [ ] Team analytics
- [ ] Webhooks for LMS integration
- [ ] Mobile-optimized investigation UI
- [ ] AI-generated mission variants from templates
