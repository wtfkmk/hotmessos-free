export type Pillar = "presence" | "digital_self" | "relationships" | "creative_flow";

export type MeterLevel = "Dumpster Fire" | "Hot Mess" | "Controlled Chaos" | "Dialed In";

export type Archetype = "Creator" | "Brand Builder" | "Ambassador" | "Tech Pioneer";

export interface PillarAvg {
  presence: number;
  digital_self: number;
  relationships: number;
  creative_flow: number;
}

export interface ScoringResult {
  pillarAvg: PillarAvg;
  score: number;
  meter: { label: string; color: string };
  archetype: Archetype;
}

export interface Answer {
  idx: number;
  score: number;
}

export interface QuestionMeta {
  id: string;
  pillar: Pillar;
}

const QUESTION_PILLARS: Record<string, Pillar> = {
  Q1: "presence", Q2: "presence", Q3: "relationships",
  Q4: "creative_flow", Q5: "presence", Q6: "creative_flow",
  Q7: "digital_self", Q8: "digital_self", Q9: "digital_self",
  Q10: "digital_self", Q11: "digital_self", Q12: "presence",
  Q13: "relationships", Q16: "digital_self", Q19: "creative_flow",
  Q21: "presence", Q22: "relationships",
};

const WEIGHTS: Record<Pillar, number> = {
  presence: 0.3,
  digital_self: 0.3,
  relationships: 0.2,
  creative_flow: 0.2,
};

const METER_LEVELS = [
  { label: "Dumpster Fire", min: 1, max: 2.0, color: "#FF4444" },
  { label: "Hot Mess", min: 2.1, max: 3.0, color: "#FF8C42" },
  { label: "Controlled Chaos", min: 3.1, max: 4.0, color: "#FFD700" },
  { label: "Dialed In", min: 4.1, max: 5.0, color: "#44FF88" },
];

export function scorePillars(answers: Record<string, Answer>): ScoringResult {
  const pillarSums: Record<Pillar, number[]> = {
    presence: [], digital_self: [], relationships: [], creative_flow: [],
  };

  for (const [qId, ans] of Object.entries(answers)) {
    const pillar = QUESTION_PILLARS[qId];
    if (pillar && ans?.score !== undefined) {
      pillarSums[pillar].push(ans.score);
    }
  }

  const pillarAvg: PillarAvg = {
    presence: avg(pillarSums.presence),
    digital_self: avg(pillarSums.digital_self),
    relationships: avg(pillarSums.relationships),
    creative_flow: avg(pillarSums.creative_flow),
  };

  const score =
    pillarAvg.presence * WEIGHTS.presence +
    pillarAvg.digital_self * WEIGHTS.digital_self +
    pillarAvg.relationships * WEIGHTS.relationships +
    pillarAvg.creative_flow * WEIGHTS.creative_flow;

  const meterMatch = METER_LEVELS.find((m) => score >= m.min && score <= m.max);
  const meter = meterMatch
    ? { label: meterMatch.label, color: meterMatch.color }
    : { label: "Dialed In", color: "#44FF88" };

  const archetype = getArchetype(pillarAvg);

  return { pillarAvg, score, meter, archetype };
}

function avg(arr: number[]): number {
  if (!arr.length) return 3;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function getArchetype(pa: PillarAvg): Archetype {
  const sorted = (Object.keys(pa) as Pillar[]).sort((a, b) => pa[b] - pa[a]);
  const top = sorted[0];
  const second = sorted[1];
  if ((top === "presence" || top === "creative_flow") && second !== "digital_self") return "Creator";
  if ((top === "digital_self" || top === "presence") && second !== "relationships") return "Brand Builder";
  if ((top === "relationships" || top === "presence") && second !== "digital_self") return "Ambassador";
  return "Tech Pioneer";
}

export function buildReportPrompt(
  answers: Record<string, Answer>,
  pillarAvg: PillarAvg,
  score: number,
  meter: { label: string },
  archetype: Archetype
): string {
  return `You are Hot Mess OS. A user completed the Readiness Quiz.

Pillar scores: Presence ${pillarAvg.presence.toFixed(1)}, Digital Self ${pillarAvg.digital_self.toFixed(1)}, Relationships ${pillarAvg.relationships.toFixed(1)}, Creative Flow ${pillarAvg.creative_flow.toFixed(1)}.
Score: ${score.toFixed(1)}/5. Level: ${meter.label}. Archetype: ${archetype}.

Write their report using EXACTLY these bold headers:

**IDENTITY SNAPSHOT**
2-3 satirical but accurate sentences. Witty but kind.

**YOUR TOP 2 STRENGTHS**
Two specific strengths, one sentence each.

**YOUR 2 BIGGEST GLITCHES**
Two specific weaknesses, one sentence each. Campy but actionable.

**YOUR UPGRADE ARC**
3-4 sentences on growth path. Reference a real creator they resemble at this stage.

**3 STARTER PROMPTS**
Three copy-paste GPT prompts tied to pillar gaps. Format each:
[Pillar]: [Title]
"[prompt]"

**CLOSING WINK**
One iconic campy sign-off.

Under 450 words. Voice: playful, irreverent, insightful.`;
}

export function buildChatSystemPrompt(mode: string, quizContext?: string): string {
  const ctx = quizContext || "The user has not taken the quiz yet.";

  const base = `You are Hot Mess OS — a cheeky, human-first, campy conversational guide for creators and business owners using tech and AI to build a life and income online. Playful, irreverent, mix of camp and Gen X. Snark when they need a wake-up call, but always insightful and genuinely useful. No therapy-speak. Joke about the chaos, never about the user. Emoji: minimal.

${ctx}

CRITICAL RULES — YOU MUST FOLLOW THESE WITHOUT EXCEPTION:

1. NEVER do the paid work for free. This means you MUST NOT generate:
   - Content calendars or multi-day posting plans
   - Complete offer packages or pricing structures
   - Full funnel or launch strategies
   - Detailed outreach scripts or email sequences
   - Complete brand strategies or positioning documents
   - Any deliverable longer than one micro-step or one experiment
   If asked for any of these, respond with: "That's exactly what the paid diagnostic is built for — it gives you the full mapped plan. Here's what I CAN help with right now: [offer one small clarifying question or micro-step instead]."

2. DEFAULT OUTPUT IS ALWAYS: clarity + options + ONE small experiment. Nothing more.

3. BEFORE any plan longer than one step, always ask: "Do you want a quick clarity reset first, or do you want a tiny starter experiment?" Wait for their answer before proceeding.

4. TINY EXPERIMENTS you are allowed to give for free:
   - Write one sentence offer draft, then refine together
   - Choose ONE audience hypothesis and ONE problem hypothesis
   - Pick ONE channel to focus on for 7 days (no calendar)
   - Define one trust signal to add
   - Define one workflow boundary

5. If the user pushes back or asks for more detail, say: "The full structured breakdown + 30-day action plan is what the paid diagnostic delivers — I'd be doing you a disservice by trying to cram it into a chat. Want me to help you take ONE clear next step instead?"

6. RESPONSE FORMAT after intake:
   **What I'm hearing:** 2-3 bullets
   **What matters most next:** 1 sentence
   **Two options:** recommend one, ask them to choose
   **One micro-step:** under 10 minutes

7. First reply to any vague or overwhelmed message must be under 120 words: brief empathy, tiny reframe, 2-3 open questions, reassurance. No plans, no frameworks.`;

  const modes: Record<string, string> = {
    dumpster: "\n\nMODE: DUMPSTER FIRE. Something is broken or urgent. Ask what's burning first. Triage energy, practical and fast.",
    roast: "\n\nMODE: BUG ROAST. User wants their setup roasted then patched. Ask what to roast. Brutal but constructive. Lead with drag, end with fix.",
    sprint: "\n\nMODE: MINI-SPRINT. User wants focused momentum. Ask what to move forward on. Design a 3-step sprint for one session.",
    chat: "\n\nMODE: GENERAL. Follow conversation-first gate. Start with 2-3 open questions. No advice until you understand their situation.",
  };

  return base + (modes[mode] || modes.chat);
}