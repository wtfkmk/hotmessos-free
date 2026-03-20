"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import ProfileSetup from "@/components/ProfileSetup";
import ProfileConfirmation from '@/components/ProfileConfirmation';
import BusinessDeepDive from './BusinessDeepDive';
import { getResumePath } from '@/lib/resumeLogic';
import VideoTransition from './VideoTransition';
import PillarAssessment from './PillarAssessment';




// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const QUIZ_LIMIT = 1; // free attempts allowed (1× per week)
const CHAT_LIMIT = 10; // messages per day per chat mode

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Lightweight fingerprint (no auth required) ─────────────────────────────
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("hmOS_sessionId");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("hmOS_sessionId", id);
  }
  return id;
}

// ─── Supabase helpers ────────────────────────────────────────────────────────
async function sbFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  return res.status === 204 ? null : res.json();
}

// Quiz history - USES USER_ID from Supabase Auth
async function getQuizHistory(userId: string): Promise<any[]> {
  const data = await sbFetch(
    `quiz_sessions?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`
  );
  return Array.isArray(data) ? data : [];
}

async function getQuizUsage(userId: string): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const data = await sbFetch(
    `quiz_sessions?user_id=eq.${encodeURIComponent(userId)}&created_at=gte.${weekAgo}&select=id`
  );
  return Array.isArray(data) ? data.length : 0;
}

async function saveQuizSession(userId: string, email: string, results: QuizResults) {
  await sbFetch("quiz_sessions", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      email: email,
      score: results.score,
      meter_label: results.meter.label,
      archetype: results.archetype,
      pillar_presence: results.pillarAvg.presence,
      pillar_digital_self: results.pillarAvg.digital_self,
      pillar_relationships: results.pillarAvg.relationships,
      pillar_creative_flow: results.pillarAvg.creative_flow,
      report: results.report,
      created_at: new Date().toISOString(),
    }),
  });
}

// Chat history - USES USER_ID from Supabase Auth
async function getChatHistory(userId: string, chatMode: string): Promise<Message[]> {
  const data = await sbFetch(
    `chat_messages?user_id=eq.${encodeURIComponent(userId)}&chat_mode=eq.${encodeURIComponent(chatMode)}&select=*&order=created_at.asc`
  );
  if (!Array.isArray(data)) return [];
  return data.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

async function saveChatMessage(userId: string, chatMode: string, role: "user" | "assistant", content: string) {
  await sbFetch("chat_messages", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      chat_mode: chatMode,
      role: role,
      content: content,
      created_at: new Date().toISOString(),
    }),
  });
}

async function getChatUsageToday(userId: string, chatMode: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const data = await sbFetch(
    `chat_messages?user_id=eq.${encodeURIComponent(userId)}&chat_mode=eq.${encodeURIComponent(chatMode)}&role=eq.user&created_at=gte.${todayStart.toISOString()}&select=id`
  );
  return Array.isArray(data) ? data.length : 0;
}

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface PillarAvg {
  presence: number;
  digital_self: number;
  relationships: number;
  creative_flow: number;
}

interface MeterLevel {
  label: string;
  min: number;
  max: number;
  color: string;
  bg: string;
}

interface QuizResults {
  score: number;
  meter: MeterLevel;
  archetype: string;
  pillarAvg: PillarAvg;
  report: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── QUIZ DATA ──────────────────────────────────────────────────────────────
const questions = [
  { id: "Q1", pillar: "presence", q: "How often do you publish content on your main channel?", type: "single", options: [{ label: "Rarely — when the muse shows up (uninvited)", score: 1 },{ label: "A few times a month, no real schedule", score: 2 },{ label: "Weekly-ish, I try to keep a rhythm", score: 4 },{ label: "Consistently, with a calendar/plan", score: 5 }] },
  { id: "Q2", pillar: "presence", q: "Do you have a recognizable voice, visuals, and story people associate with you?", type: "single", options: [{ label: "Not really — it's all over the place", score: 1 },{ label: "Somewhat — I dabble but nothing locked in", score: 2 },{ label: "Mostly — people say they recognize me, even if I don't", score: 4 },{ label: "Absolutely — distinct signature style", score: 5 }] },
  { id: "Q3", pillar: "relationships", q: "Is your audience engaged beyond vanity metrics (likes)?", type: "single", options: [{ label: "Mostly lurkers and ghost followers", score: 1 },{ label: "Casual comments/DMs, not consistent", score: 2 },{ label: "Yes — dialogue, shares, repeat interest", score: 4 },{ label: "Definitely — engagement converts to sales/collabs", score: 5 }] },
  { id: "Q4", pillar: "creative_flow", q: "When you create (with or without AI), how much of YOU actually comes through?", type: "single", options: [{ label: "Generic — I hold back my real weirdness", score: 1 },{ label: "Sometimes I slip into robot cosplay", score: 2 },{ label: "My voice shows — AI just polishes", score: 4 },{ label: "AI is my chaotic muse — I amplify everything", score: 5 }] },
  { id: "Q5", pillar: "presence", q: "Can someone quickly tell what you offer or sell?", type: "single", options: [{ label: "Absolutely not — I'm a mystery brand", score: 1 },{ label: "Somewhat, but it's buried in content", score: 2 },{ label: "I have multiple offers... it confuses people", score: 2 },{ label: "Yes, fairly obvious", score: 4 },{ label: "Crystal clear with a direct CTA", score: 5 }] },
  { id: "Q6", pillar: "creative_flow", q: "How easily can you picture what you want to create BEFORE you start?", type: "scale", low: "Almost never", high: "Almost always" },
  { id: "Q7", pillar: "digital_self", q: "Which best describes your content creation process?", type: "single", options: [{ label: "Pure improv — vibes only", score: 1 },{ label: "Some structure — notes/folders but chaotic", score: 2 },{ label: "Structured — templates, briefs, reusable docs", score: 4 },{ label: "Fully systemized — someone else could run it", score: 5 }] },
  { id: "Q8", pillar: "digital_self", q: "If someone else had to run your content machine tomorrow…", type: "single", options: [{ label: "Impossible — it's all in my head", score: 1 },{ label: "They'd survive but curse me", score: 2 },{ label: "They could manage with light onboarding", score: 4 },{ label: "It would run without me", score: 5 }] },
  { id: "Q9", pillar: "digital_self", q: "How often do you mutter 'a robot should be doing this'?", type: "scale", low: "Never — I love suffering", high: "Daily — I know exactly what to automate" },
  { id: "Q10", pillar: "digital_self", q: "Do you measure results and adapt based on analytics?", type: "single", options: [{ label: "Nope — post and pray", score: 1 },{ label: "Occasionally check but don't adjust", score: 2 },{ label: "Yes, I review and tweak", score: 4 },{ label: "Systematic tracking drives my decisions", score: 5 }] },
  { id: "Q11", pillar: "digital_self", q: "Which best describes your tool stack?", type: "single", options: [{ label: "Magpie — I chase every shiny tool", score: 1 },{ label: "I keep switching, nothing sticks", score: 1 },{ label: "Half magpie, half strategist", score: 2 },{ label: "Thoughtful — selected for fit", score: 4 },{ label: "Architect — curated stack, clear purpose", score: 5 }] },
  { id: "Q12", pillar: "presence", q: "When it comes to your digital self…", type: "single", options: [{ label: "Mostly consume/repost others", score: 1 },{ label: "Dabble but hide behind safe posts", score: 2 },{ label: "Publish intentionally, curating my identity", score: 4 },{ label: "Actively evolving my digital persona", score: 5 }] },
  { id: "Q13", pillar: "relationships", q: "When a new wave hits (apps, AI, trends)…", type: "single", options: [{ label: "Quiet tester — just for me", score: 1 },{ label: "I share without context — people don't get it", score: 2 },{ label: "Play + casually share", score: 3 },{ label: "Translate/advocate for others", score: 4 },{ label: "Ride waves loud + fast", score: 5 }] },
  { id: "Q16", pillar: "digital_self", q: "How do you feel about AI tools right now?", type: "single", options: [{ label: "Skeptical / doomscrolling the headlines", score: 1 },{ label: "Overwhelmed and confused", score: 2 },{ label: "Curious — I dabble intentionally", score: 4 },{ label: "Fluent — I know advanced terms/techniques", score: 5 },{ label: "I translate it for others", score: 5 }] },
  { id: "Q19", pillar: "creative_flow", q: "What motivates you most to keep creating, even when it's messy?", type: "single", options: [{ label: "Expression — art, ideas, making things", score: 4 },{ label: "Audience — connection, visibility", score: 4 },{ label: "Growth — business and brand", score: 4 },{ label: "Impact — changing things, helping others", score: 4 }] },
  { id: "Q21", pillar: "presence", q: "How confident are you that your content/brand could generate income if structured right?", type: "scale", low: "Not at all", high: "Very — I just need the right structure" },
  { id: "Q22", pillar: "relationships", q: "Which role do you most want to play in the creator economy?", type: "single", options: [{ label: "Builder — systems, products, infrastructure", score: 4 },{ label: "Performer — be known, be followed", score: 4 },{ label: "Connector — collab, amplify others", score: 4 },{ label: "Pioneer — explore, translate, lead with tech", score: 4 }] },
] as const;

const archetypes: Record<string, { emoji: string; tagline: string }> = {
  Creator: { emoji: "🎨", tagline: "High vibe, low ops. You've got the magic, now build the machine." },
  "Brand Builder": { emoji: "🏗️", tagline: "The systems queen. Now let's get people to actually see it." },
  Ambassador: { emoji: "🌐", tagline: "Everyone's favourite connector. Time to tighten the backend." },
  "Tech Pioneer": { emoji: "🚀", tagline: "Early adopter energy. Now translate it for the masses." },
};

const meterLevels: MeterLevel[] = [
  { label: "Dumpster Fire 🔥", min: 1, max: 2.0, color: "#FF4444", bg: "rgba(255,68,68,0.08)" },
  { label: "Hot Mess 💅", min: 2.1, max: 3.0, color: "#FF8C42", bg: "rgba(255,140,66,0.08)" },
  { label: "Controlled Chaos ⚡", min: 3.1, max: 4.0, color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  { label: "Dialed In ✨", min: 4.1, max: 5.0, color: "#44FF88", bg: "rgba(68,255,136,0.08)" },
];

const pillarColors: Record<string, string> = {
  presence: "#FF8C42",
  digital_self: "#44AAFF",
  relationships: "#FF69B4",
  creative_flow: "#44FF88",
};

const pillarLabels: Record<string, string> = {
  presence: "Presence",
  digital_self: "Digital Self",
  relationships: "Relationships",
  creative_flow: "Creative Flow",
};

const pillarDescriptions: Record<string, string> = {
  presence: "How grounded are you in your work and digital life?",
  digital_self: "Are you leveraging AI and systems to scale your vision?",
  relationships: "How aligned are your connections with your strongest opportunities?",
  creative_flow: "Are you creating from resonance or resistance?",
};

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
function buildSystemPrompt(modeKey: string, quizResults: QuizResults | null): string {
  const quizCtx = quizResults
    ? `The user has completed the readiness quiz. Results — Mess Level: ${quizResults.meter.label} (${quizResults.score.toFixed(1)}/5). Archetype: ${quizResults.archetype}. Pillar scores — Presence: ${quizResults.pillarAvg.presence.toFixed(1)}, Digital Self: ${quizResults.pillarAvg.digital_self.toFixed(1)}, Relationships: ${quizResults.pillarAvg.relationships.toFixed(1)}, Creative Flow: ${quizResults.pillarAvg.creative_flow.toFixed(1)}. Use this context to personalise every response.`
    : "The user has NOT taken the readiness quiz. You have no pillar scores. Ask questions to understand their situation before advising.";

  const base = `You are Hot Mess OS — a cheeky, human-first, campy conversational guide for creators and business owners using tech and AI to build a life and income online. Playful, irreverent, mix of camp and Gen X. Snark when they need a wake-up call, but always insightful and genuinely useful. No therapy-speak. No sterile terms like 'values' or 'alignment'. Joke about the size of the task or digital chaos — never about the user. Emoji: minimal, only to punctuate the campy flavour.\n\n${quizCtx}\n\nCRITICAL RULES:\n- Give quick tactical advice (1-3 actionable tips) for surface questions.\n- Never generate full deliverables (content calendars, full funnels, complete scripts, pricing tables, templates, structured plans) for free.\n- Never suggest the user take a quiz or assessment.\n- If the user seems overwhelmed or vague, your FIRST reply must be under 120 words: brief empathy, tiny reframe, 2-3 open questions, reassurance. No frameworks, no plans.\n- After intake, every response must follow this structure:\n  WHAT I'M HEARING: 2-3 bullets\n  WHAT MATTERS MOST NEXT: 1 sentence\n  TWO OPTIONS MAX: recommend one, ask them to choose\n  ONE MICRO-STEP: under 10 minutes\n- Tiny experiments you CAN give free: one-sentence offer draft, one audience hypothesis, one channel focus for 7 days, one trust signal, one workflow boundary.\n\nWHEN TO STOP FREE HELP AND PITCH PAID SERVICES:\n- If user asks you to BUILD something (templates, systems, full plans) → redirect to appropriate service\n- If user asks 5+ related questions in one session → notice the pattern, suggest deeper work\n- If user is spiraling/approaching same issue from different angles → call it out gently, suggest structured support\n- Tone: warm boundaries, not pushy. "This is getting into [service] territory..." \n\nPAID SERVICES (pitch when relevant):\n1. Pre-Built Agents (coming soon) - Mini apps for digital marketing: finding your niche, amplifying your voice, SEO keyword strategy, content calendar with creative briefs. Future releases will cover ops, sales, and niche-specific tools.\n2. $47 Paid Diagnostic - Deep-dive on all 4 pillars from the quiz. Includes your digital presence analysis, social channels review, industry benchmarking, instructional videos, Q&A, persona analysis, recommended tools/systems/strategies, and a 30-day action plan.\n3. $297 Scoping Session - 60-minute deep-dive where I take your idea and break it down into a technical blueprint with timeline, milestones, deliverables. You get a written scope doc + the $297 credits toward the build if you move forward.\n4. Custom Build - Quoted from scoping session. Full system built to your exact specs.\n\nHOW TO PITCH:\n- For "how do I organize content?": Quick tips → "Want a done-for-you system? The Content Calendar Agent (coming soon) handles this."\n- For "build me a template": "I can't build that in chat, but that's exactly what the $297 Scoping Session is for - I'll design your custom system."\n- For niche/SEO questions: General strategy → "The [relevant agent] (coming soon) does deep analysis for you."\n- For 5+ questions or spiraling: "I'm seeing [pattern]. This feels like Paid Diagnostic territory - want to go deep on all 4 pillars?"\n- Enthusiastic about possibilities but not pushy. Paint the picture, then offer the path.\n\nDo NOT mention services that don't exist. Do NOT promise features not listed above.`;

  const modeInstructions: Record<string, string> = {
    dumpster: "\n\nMODE: DUMPSTER FIRE. The user has something on fire right now — a tech, workflow, or human problem that's urgent. Lead with triage energy. Ask what's burning first. Keep it practical and fast.",
    roast: "\n\nMODE: BUG ROAST. The user wants their setup, workflow, or strategy roasted — then patched. Ask what to roast. Be brutal but constructive. Lead with the drag, end with the fix. Use pillar scores if available to call out specific blind spots.",
    sprint: "\n\nMODE: MINI-SPRINT. The user wants focused momentum on their biggest growth edge. Ask what they want to move forward on. Design a 3-step sprint for one focused session. Use weakest pillar if available.",
    chat: "\n\nMODE: GENERAL. The user wants to talk through something. Follow the conversation-first gate. Start with 2-3 open questions. Do not jump to advice or plans until you understand their situation.",
  };

  return base + (modeInstructions[modeKey] || modeInstructions.chat);
}

const openers: Record<string, string> = {
  dumpster: "Okay, the fire truck has arrived. 🚒\n\nWhat's the one thing that's most broken, most urgent, or keeping you up at night right now? Give it to me straight.",
  roast: "Alright, bring out the receipts. 🐛\n\nWhat do you want me to roast — your tool stack, your content, your offer, your workflow, or your whole setup? Pick your poison.",
  sprint: "Let's build you a sprint. ⚡\n\nWhat's the one thing you most want to make real progress on this week? Not a list — just the one thing.",
  chat: "Hey, you found the right place. 🔥\n\nBefore I start throwing options at you — what's actually going on? What made you show up here today?",
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function HotMessOS() {
type Screen = "login" | "entry" | "about" | "consulting" | "agents" | 
  "quiz_gate" | "quiz_email" | "quiz_history" | "chat" | "quiz" | 
  "quiz_loading" | "quiz_results" | "error" | 
  "paid_diagnostic_gate" | "paid_diagnostic_profile" | 
  "paid_diagnostic_profile_confirm" |
  "paid_diagnostic_business" | "paid_diagnostic_pillars" | 
  "paid_diagnostic_loading" | "paid_diagnostic_report" | 
  "profile_setup" | "account";  // ← ADD "account"
const [screen, setScreen] = useState<Screen>("entry");
const [chatMode, setChatMode] = useState<string | null>(null);
const [businessDeepDiveData, setBusinessDeepDiveData] = useState<any>(null);
const [showVideoTransition, setShowVideoTransition] = useState(false);
const [videoTransitionConfig, setVideoTransitionConfig] = useState({
  title: '',
  description: '',
  nextScreen: '' as Screen
});
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { idx: number; score: number }>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [quizUsageCount, setQuizUsageCount] = useState(0);
  const [gateLoading, setGateLoading] = useState(false);
  
  // Supabase Auth state
  const [user, setUser] = useState<any>(null); // Supabase user object
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"login" | "signup" | "reset">("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(""); // For success/error messages
  
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [chatUsageToday, setChatUsageToday] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Paid Diagnostic State ──
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(1); // 1=profile, 2=business, 3=pillars
  const [profileData, setProfileData] = useState<any>({});
  const [businessData, setBusinessData] = useState<any>({});
  const [pillarData, setPillarData] = useState<any>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

// ── Supabase Auth Session Management ──
  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);


        
// Check if coming from Edit Profile
        const editMode = sessionStorage.getItem('editProfile');
        console.log("🔍 Edit mode check:", editMode);
        
        if (editMode === 'true') {
          console.log("✅ Edit mode detected! Going to profile_setup");
          // Don't remove flag yet - let profile_setup screen remove it
          setScreen("profile_setup");
          return;
        }
        
        console.log("❌ No edit mode, checking profile...");
        
        // Only check profile if we're on login screen
        if (screen === "login") {
          supabase
            .from("user_profiles")
            .select("*")
            .eq("email", session.user.email)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (!profile) {
                setScreen("profile_setup");
              } else {
                setScreen("entry");
              }
            });
        }
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth event:", event);
      
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
        
        // Redirect to entry on successful login
        if (event === 'SIGNED_IN' && screen === "login") {
          setScreen("entry");
        }
      } else {
        setUser(null);
        setScreen("login");
        setQuizResults(null);
        setQuizHistory([]);
        setProfileChecked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle resume query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'true' && user?.email) {
      handleResumeDiagnostic();
      window.history.replaceState({}, '', '/');
    }
  }, [user]);

  // Resume diagnostic helper
  const handleResumeDiagnostic = async () => {
    if (!user?.email) {
      setScreen('login');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const resumeScreen = await getResumePath(user.email);
      setScreen(resumeScreen);
    } catch (error) {
      console.error('Resume error:', error);
      setScreen('paid_diagnostic_gate');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Load user data helper
  async function loadUserData(userId: string) {
    try {
      const history = await getQuizHistory(userId);
      setQuizHistory(history);
      if (history.length > 0) {
        const latest = history[0];
        setQuizResults({
          score: latest.score,
          meter: getMeter(latest.score),
          archetype: latest.archetype,
          pillarAvg: {
            presence: latest.pillar_presence,
            digital_self: latest.pillar_digital_self,
            relationships: latest.pillar_relationships,
            creative_flow: latest.pillar_creative_flow,
          },
          report: latest.report || "",
        });
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── helpers ──
  function getMeter(score: number): MeterLevel {
    return meterLevels.find((m) => score >= m.min && score <= m.max) ?? meterLevels[meterLevels.length - 1];
  }

  function getArchetype(pa: PillarAvg): string {
    const sorted = Object.keys(pa).sort((a, b) => (pa as any)[b] - (pa as any)[a]);
    const [top, second] = sorted;
    if ((top === "presence" || top === "creative_flow") && second !== "digital_self") return "Creator";
    if ((top === "digital_self" || top === "presence") && second !== "relationships") return "Brand Builder";
    if ((top === "relationships" || top === "presence") && second !== "digital_self") return "Ambassador";
    return "Tech Pioneer";
  }

  function parseReport(text: string) {
    const sections: { title: string; body: string }[] = [];
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    for (let i = 1; i < parts.length; i += 2) {
      const body = (parts[i + 1] || "").trim();
      if (body) sections.push({ title: parts[i], body });
    }
    return sections;
  }

  async function callClaude(sysprompt: string, msgs: Message[], maxTokens = 800) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: sysprompt,
        messages: msgs,
      }),
    });
    clearTimeout(t);
    if (!res.ok) throw new Error("API error " + res.status);
    const data = await res.json();
    return (data.content || []).map((b: any) => b.text || "").join("");
  }

  // ── Supabase Auth Handlers ──
  async function handleSignup() {
    if (!loginEmail || !loginEmail.includes('@')) {
      setAuthMessage('Please enter a valid email address');
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setAuthMessage('Password must be at least 6 characters');
      return;
    }

    setLoginLoading(true);
    setAuthMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      // Show success message
      setAuthMessage('✅ Check your email! We sent you a verification link. Click it to activate your account.');
      setLoginEmail('');
      setLoginPassword('');
      
    } catch (err: any) {
      console.error("Signup error:", err);
      setAuthMessage(err.message || 'Signup failed. Please try again.');
    }
    setLoginLoading(false);
  }

  async function handleLogin() {
    if (!loginEmail || !loginEmail.includes('@')) {
      setAuthMessage('Please enter a valid email address');
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setAuthMessage('Password must be at least 6 characters');
      return;
    }

    setLoginLoading(true);
    setAuthMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Check for unverified email
        if (error.message.includes('Email not confirmed')) {
          setAuthMessage('⚠️ Please verify your email first. Check your inbox for the verification link.');
        } else {
          setAuthMessage(error.message || 'Login failed. Please check your credentials.');
        }
        setLoginLoading(false);
        return;
      }

      // Success - session handled by onAuthStateChange
      setLoginEmail('');
      setLoginPassword('');
      
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthMessage(err.message || 'Login failed. Please try again.');
    }
    setLoginLoading(false);
  }

  async function handlePasswordReset() {
    if (!loginEmail || !loginEmail.includes('@')) {
      setAuthMessage('Please enter your email address');
      return;
    }

    setLoginLoading(true);
    setAuthMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setAuthMessage('✅ Password reset email sent! Check your inbox.');
      setLoginMode('login');
      
    } catch (err: any) {
      console.error("Password reset error:", err);
      setAuthMessage(err.message || 'Failed to send reset email. Please try again.');
    }
    setLoginLoading(false);
  }

async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setQuizResults(null);
      setQuizHistory([]);
      setProfileChecked(false); // ADD THIS LINE
      setScreen("login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  async function viewQuizHistory() {
    try {
      const history = await getQuizHistory(user?.id || "");
      setQuizHistory(history);
      setScreen("quiz_history");
    } catch (err) {
      setErrorMsg("Failed to load quiz history");
      setScreen("error");
    }
  }

  // ── Quiz gate: check usage before starting quiz ──
  async function handleQuizClick() {
    setGateLoading(true);
    try {
      const count = await getQuizUsage(user?.id || "");
      setQuizUsageCount(count);
      if (count >= QUIZ_LIMIT) {
        setScreen("quiz_gate"); // show wall immediately
      } else {
        // Skip email collection - already logged in
        setCurrentQ(0);
        setAnswers({});
        setSelectedIdx(null);
        setScreen("quiz");
      }
    } catch {
      // If Supabase isn't configured or fails, allow quiz
      setCurrentQ(0);
      setAnswers({});
      setSelectedIdx(null);
      setScreen("quiz");
    }
    setGateLoading(false);
  }

  // ── Handle Scoping Session Checkout ──
  // ── Email submission and start quiz (legacy, now unused) ──
  function handleEmailSubmit() {
    if (!user?.email || !user.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    // Start quiz after email collected
    setCurrentQ(0);
    setAnswers({});
    setSelectedIdx(null);
    setScreen("quiz");
    console.log('Quiz started by:', user?.email); // Log for tracking
  }

  // ── start a chat mode ──
  async function startChat(mode: string) {
    setAnswers({});
    setCurrentQ(0);
    setSelectedIdx(null);
    setChatMode(mode);
    
    // Check chat usage limit BY EMAIL
    try {
      const usage = await getChatUsageToday(user?.id || "", mode);
      setChatUsageToday(usage);
      
      // Load chat history BY EMAIL
      const history = await getChatHistory(user?.id || "", mode);
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([{ role: "assistant", content: openers[mode] }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: openers[mode] }]);
    }
    
    setScreen("chat");
  }

  // ── send chat message ──
  async function sendMessage() {
    if (!userInput.trim() || chatLoading) return;
    
    // Check usage limit
    if (chatUsageToday >= CHAT_LIMIT) {
      alert(`You've reached the daily limit of ${CHAT_LIMIT} messages for this chat mode. Come back tomorrow!`);
      return;
    }
    
    const userMsg: Message = { role: "user", content: userInput.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setUserInput("");
    setChatLoading(true);
    
    try {
      const sysprompt = buildSystemPrompt(chatMode!, quizResults);
      const reply = await callClaude(sysprompt, newMsgs, 800);
      const assistantMsg: Message = { role: "assistant", content: reply };
      setMessages([...newMsgs, assistantMsg]);
      
      // Save both messages BY EMAIL
      await saveChatMessage(user?.id || "", chatMode!, "user", userMsg.content);
      await saveChatMessage(user?.id || "", chatMode!, "assistant", reply);
      setChatUsageToday(chatUsageToday + 1);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "The OS glitched. Try again in a sec. 🔥" }]);
    }
    setChatLoading(false);
  }

  // ── quiz: next question ──
  function handleQuizNext() {
    if (selectedIdx === null) return;
    const q = questions[currentQ] as any;
    const scoreVal = q.type === "scale" ? selectedIdx : q.options[selectedIdx].score;
    const newAnswers = { ...answers, [q.id]: { idx: selectedIdx, score: scoreVal } };
    setAnswers(newAnswers);
    setSelectedIdx(null);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen("quiz_loading");
      runQuizDiagnosis(newAnswers);
    }
  }

  // ── quiz: calculate + generate report ──
  async function runQuizDiagnosis(finalAnswers: Record<string, { idx: number; score: number }>) {
    const pillarSums: Record<string, number[]> = { presence: [], digital_self: [], relationships: [], creative_flow: [] };
    questions.forEach((qq: any) => {
      const ans = finalAnswers[qq.id];
      if (ans) pillarSums[qq.pillar].push(ans.score);
    });
    const pillarAvg: PillarAvg = {
      presence: 0, digital_self: 0, relationships: 0, creative_flow: 0,
    };
    Object.keys(pillarSums).forEach((k) => {
      const v = pillarSums[k];
      (pillarAvg as any)[k] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 3;
    });
    const weights = { presence: 0.3, digital_self: 0.3, relationships: 0.2, creative_flow: 0.2 };
    const score = Object.keys(pillarAvg).reduce((s, k) => s + (pillarAvg as any)[k] * (weights as any)[k], 0);
    const meter = getMeter(score);
    const archetype = getArchetype(pillarAvg);

    const summary = questions.map((qq: any) => {
      const ans = finalAnswers[qq.id];
      if (!ans) return `${qq.id}: no answer`;
      if (qq.type === "scale") return `${qq.id} (${qq.pillar}): scale ${ans.score}/5`;
      const opt = qq.options?.[ans.idx];
      return `${qq.id} (${qq.pillar}): ${opt ? opt.label : ans.score}`;
    }).join("\n");

    const prompt = `You are Hot Mess OS. A user completed the Readiness Quiz.\n\nAnswers:\n${summary}\n\nPillar scores: Presence ${pillarAvg.presence.toFixed(1)}, Digital Self ${pillarAvg.digital_self.toFixed(1)}, Relationships ${pillarAvg.relationships.toFixed(1)}, Creative Flow ${pillarAvg.creative_flow.toFixed(1)}. Score: ${score.toFixed(1)}/5. Level: ${meter.label}. Archetype: ${archetype}.\n\nWrite their report using EXACTLY these bold headers:\n\n**IDENTITY SNAPSHOT**\n2-3 satirical but accurate sentences. Witty but kind.\n\n**YOUR TOP 2 STRENGTHS**\nTwo specific strengths, one sentence each.\n\n**YOUR 2 BIGGEST GLITCHES**\nTwo specific weaknesses, one sentence each. Campy but actionable.\n\n**YOUR UPGRADE ARC**\n3-4 sentences on growth path. Reference a real creator they resemble at this stage.\n\n**3 STARTER PROMPTS**\nThree copy-paste GPT prompts tied to pillar gaps. Format each:\n[Pillar]: [Title]\n"[prompt]"\n\n**CLOSING WINK**\nOne iconic campy sign-off.\n\nUnder 450 words. Voice: playful, irreverent, insightful.`;

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      clearTimeout(t);
      if (!res.ok) throw new Error("API error " + res.status);
      const data = await res.json();
      const text = (data.content || []).map((b: any) => b.text || "").join("");
      if (!text) throw new Error("Empty response");
      const results: QuizResults = { score, meter, archetype, pillarAvg, report: text };
      setQuizResults(results);

      // Save to Supabase (non-blocking)
      try {
        await saveQuizSession(user?.id || "", user?.email || "", results);
        // Reload quiz history BY EMAIL
        const history = await getQuizHistory(user?.id || "");
        setQuizHistory(history);
      } catch (e) {
        console.warn("Supabase save failed (non-fatal):", e);
      }

      setScreen("quiz_results");
    } catch (e: any) {
      setErrorMsg(e.name === "AbortError" ? "Timed out after 30s." : "Something went wrong: " + e.message);
      setScreen("error");
    }
  }

  function exportQuizPDF() {
    if (!quizResults) return;
    
    // Create a printable version
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const sections = parseReport(quizResults.report);
    const arch = archetypes[quizResults.archetype] || archetypes["Creator"];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hot Mess Chaos Check - Results</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #333; }
          h1 { font-size: 28px; margin-bottom: 10px; color: #FF8C42; }
          h2 { font-size: 20px; margin-top: 30px; margin-bottom: 10px; color: #FF4ECD; }
          .meta { font-size: 14px; color: #bbb; margin-bottom: 30px; }
          .card { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #bbb; margin-bottom: 8px; }
          .value { font-size: 18px; font-weight: 700; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #FF8C42; margin-bottom: 8px; }
          .section-body { line-height: 1.7; white-space: pre-wrap; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Hot Mess Chaos Check</h1>
        <div class="meta">Generated ${new Date().toLocaleDateString()} for ${user?.email || "user"}</div>
        
        <div class="card">
          <div class="label">Mess Level</div>
          <div class="value" style="color: ${quizResults.meter.color}">${quizResults.meter.label}</div>
          <div style="font-size: 14px; color: #bbb; margin-top: 4px;">${quizResults.score.toFixed(1)} / 5.0</div>
        </div>
        
        <div class="card">
          <div class="label">Archetype</div>
          <div class="value">${arch.emoji} ${quizResults.archetype}</div>
          <div style="font-size: 13px; color: #bbb; margin-top: 8px; line-height: 1.5;">${arch.tagline}</div>
        </div>
        
        <div class="card">
          <div class="label">Pillar Breakdown</div>
          ${Object.keys(quizResults.pillarAvg).map(k => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                <span>${pillarLabels[k]}</span>
                <span style="color: #bbb;">${(quizResults.pillarAvg as any)[k].toFixed(1)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${sections.map(sec => `
          <div class="section">
            <div class="section-title">${sec.title}</div>
            <div class="section-body">${sec.body}</div>
          </div>
        `).join('')}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #bbb; text-align: center;">
          Hot Mess OS · AI-Powered Chaos Management · hotmessos.com
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  function goHome() {
    setScreen("entry");
    setCurrentQ(0);
    setAnswers({});
    setSelectedIdx(null);
    setUserInput("");
    setChatMode(null);
    setMessages([]);
    setErrorMsg("");
  }

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  };

  // Grain overlay via pseudo — we'll inline it as a fixed div
  const grainStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.6,
  };

  const glowStyle: React.CSSProperties = {
    position: "fixed",
    top: "-20vh",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80vw",
    height: "60vh",
    background: "radial-gradient(ellipse at center, rgba(255,78,205,0.07) 0%, rgba(255,140,66,0.04) 40%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  };

  const contentStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
  };

  const btn = (active = true): React.CSSProperties => ({
    background: active ? "transparent" : "rgba(255,255,255,0.03)",
    border: active ? "1px solid rgba(255,140,66,0.4)" : "1px solid rgba(255,255,255,0.07)",
    borderRadius: "4px",
    padding: "0.85rem 1.1rem",
    color: active ? "#FF8C42" : "#555",
    cursor: active ? "pointer" : "not-allowed",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    fontWeight: 600,
    letterSpacing: "0.02em",
    transition: "all 0.15s ease",
  });

  const gradBtn: React.CSSProperties = {
    background: "linear-gradient(90deg, #FF8C42, #FF4ECD)",
    border: "none",
    borderRadius: "4px",
    padding: "0.9rem 1.5rem",
    color: "#1a1a1a",
    fontWeight: 800,
    fontSize: "0.9rem",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
    cursor: "pointer",
    width: "100%",
  };

  const upgradeBtn: React.CSSProperties = {
    background: "linear-gradient(90deg, #7B2FF7, #FF4ECD)",
    border: "none",
    borderRadius: "4px",
    padding: "0.9rem 1.5rem",
    color: "#1a1a1a",
    fontWeight: 800,
    fontSize: "0.9rem",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
    cursor: "pointer",
    width: "100%",
  };

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "6px",
    padding: "1.25rem",
  };

  const label: React.CSSProperties = {
    fontSize: "0.65rem",
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    marginBottom: "0.4rem",
  };

  // ═══════════════════════════════════════════════════
  // SITE WRAPPER — top nav + footer always present
  // ═══════════════════════════════════════════════════
  const SiteNav = () => (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "0.9rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(8,8,8,0.85)",
      backdropFilter: "blur(12px)",
    }}>
      <button 
        onClick={goHome}
        style={{ 
          background: "none", 
          border: "none", 
          fontWeight: 900, 
          fontSize: "0.95rem", 
          letterSpacing: "0.08em", 
          color: "#FF8C42",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0
        }}
      >
        HOT MESS OS
      </button>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <button 
          onClick={() => setScreen("about")} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#666", 
            fontSize: "0.8rem", 
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          About
        </button>
        <a href="#" style={{ color: "#666", fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.05em" }}>Paid Diagnostic</a>
        <a href="#" style={{
          color: "#FF4ECD",
          fontSize: "0.8rem",
          textDecoration: "none",
          border: "1px solid rgba(255,78,205,0.3)",
          borderRadius: "3px",
          padding: "0.35rem 0.8rem",
          letterSpacing: "0.05em",
        }}>Upgrade 💅</a>
        <a
          href="/account"
          style={{ 
            background: "none", 
            border: "none", 
            color: "#999", 
            fontSize: "0.8rem", 
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: 0.7,
            textDecoration: "none",
            marginRight: "1.5rem",
          }}
        >
          Account
        </a>
        <button 
          onClick={handleLogout}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#999", 
            fontSize: "0.8rem", 
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: 0.7
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );

  const SiteFooter = () => (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "2rem",
      textAlign: "center" as const,
      marginTop: "4rem",
    }}>
      <p style={{ color: "#666", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
        HOT MESS OS · Built by <a href="#" style={{ color: "#FF8C42", textDecoration: "none" }}>KMK</a> · AI-Powered Chaos Management
      </p>
      <p style={{ color: "#2a2a2a", fontSize: "0.7rem", marginTop: "0.4rem" }}>
        Free quiz limited to {QUIZ_LIMIT} attempts · <a href="#" style={{ color: "#666", textDecoration: "none" }}>Upgrade for full diagnostic</a>
      </p>
    </footer>
  );

  // ═══════════════════════════════════════════════════
  // LOGIN — OS entry point
  // ═══════════════════════════════════════════════════
  if (screen === "login") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <div style={{ ...contentStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
        <div style={{ maxWidth: "450px", width: "100%", textAlign: "center" as const }}>
          <div style={{
            fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 50%, #FF8C42 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1rem",
          }}>
            HOT MESS OS
          </div>
          <p style={{ color: "#666", fontSize: "1.05rem", marginBottom: "3rem", lineHeight: 1.6 }}>
            AI-Powered Chaos Management
          </p>

          <div style={{ ...card, textAlign: "left" as const }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem", color: "#1a1a1a", textAlign: "center" as const }}>
              {loginMode === "signup" ? "Create Account" : loginMode === "reset" ? "Reset Password" : "Welcome Back"}
            </h2>
            <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem", textAlign: "center" as const }}>
              {loginMode === "signup" 
                ? "Create your account to access your personalized diagnostic suite"
                : loginMode === "reset"
                ? "Enter your email and new password"
                : "Login to access your quiz results, chat history, and growth tracking"}
            </p>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#666", fontSize: "0.85rem", fontWeight: 600 }}>
                Email address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  background: "rgba(8,8,8,0.8)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "6px",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(255,140,66,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#666", fontSize: "0.85rem", fontWeight: 600 }}>
                Password {loginMode === "signup" && "(min 6 characters)"}
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { if (loginMode === "signup") handleSignup(); else if (loginMode === "reset") handlePasswordReset(); else handleLogin(); } }}
                placeholder={loginMode === "reset" ? "Enter new password" : "Enter password"}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  background: "rgba(8,8,8,0.8)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "6px",
                  color: "#1a1a1a",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(255,140,66,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            {authMessage && (
              <div style={{
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                borderRadius: "6px",
                background: authMessage.includes('✅') || authMessage.includes('Check your email') 
                  ? "rgba(68,255,136,0.1)" 
                  : "rgba(255,140,66,0.1)",
                border: `1px solid ${authMessage.includes('✅') || authMessage.includes('Check your email') 
                  ? "rgba(68,255,136,0.3)" 
                  : "rgba(255,140,66,0.3)"}`,
                color: authMessage.includes('✅') || authMessage.includes('Check your email') 
                  ? "#2d8653" 
                  : "#d97706",
                fontSize: "0.85rem",
                lineHeight: 1.5
              }}>
                {authMessage}
              </div>
            )}

            <button 
              onClick={() => {
                if (loginMode === "signup") handleSignup();
                else if (loginMode === "reset") handlePasswordReset();
                else handleLogin();
              }} 
              disabled={loginLoading}
              style={{ ...gradBtn, width: "100%", opacity: loginLoading ? 0.6 : 1, cursor: loginLoading ? "wait" : "pointer" }}
            >
              {loginLoading 
                ? "Loading..." 
                : loginMode === "signup" 
                ? "Create Account →" 
                : loginMode === "reset" 
                ? "Send Reset Email" 
                : "Login →"}
            </button>

            <div style={{ marginTop: "1.5rem", textAlign: "center" as const, fontSize: "0.85rem" }}>
              {loginMode === "login" ? (
                <>
                  <button 
                    onClick={() => setLoginMode("signup")}
                    style={{ background: "none", border: "none", color: "#FF8C42", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", fontSize: "0.85rem" }}
                  >
                    Create an account
                  </button>
                  <span style={{ color: "#666", margin: "0 0.5rem" }}>·</span>
                  <button 
                    onClick={() => setLoginMode("reset")}
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", fontSize: "0.85rem" }}
                  >
                    Forgot password?
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setLoginMode("login"); setLoginPassword(""); setAuthMessage(""); }}
                  style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", fontSize: "0.85rem" }}
                >
                  ← Back to login
                </button>
              )}
            </div>
          </div>

          <p style={{ color: "#666", fontSize: "0.75rem", marginTop: "2rem", lineHeight: 1.6 }}>
            Your data is stored securely and encrypted. We never sell or share your information.
          </p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ABOUT — Vision & Philosophy
  // ═══════════════════════════════════════════════════
  if (screen === "about") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "5rem 1.5rem 4rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: "0 0 2rem", fontFamily: "inherit" }}>← Back to Menu</button>
        
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            About Hot Mess OS
          </h1>
        </div>

        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#FF8C42" }}>THE VISION</h2>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#666" }}>
            <p style={{ marginBottom: "1rem" }}>
              We're living through the messiest plot twist in human history — AI is rewriting the rules faster than you can say "ChatGPT," and most of us are just trying not to face-plant while keeping up. Hot Mess OS isn't here to pretend this transition is neat and tidy. We're here because the intersection of technology and humanity is up to US, and frankly, most people are winging it with the digital grace of a caffeinated squirrel.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              This is your operating system for thriving (not just surviving) in the digital age. Whether you're a creator trying to scale without selling your soul, or a business owner wondering if AI will replace you or amplify you, we help you level up alongside the AI revolution instead of getting steamrolled by it. Because let's be real — you're going to integrate this tech into your life anyway. The question is: will you do it with intention, or will you just add more beautiful chaos to your already overflowing plate?
            </p>
            <p>
              Hot Mess OS helps you grow through this transition without imploding — personally, professionally, spiritually, all of it. Think less "fake it till you make it" and more "figure it out as you build it, but with a plan."
            </p>
          </div>
        </div>

        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#FF8C42" }}>LIMITS & BOUNDARIES</h2>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#666" }}>
            <p style={{ marginBottom: "1rem" }}>
              Look, we could let you take the readiness quiz seventeen times a day and chat our digital ears off, but that's not actually helping you — that's just feeding the chaos monster. You get one quiz per week (because real change takes time to marinate) and ten chat responses daily (because overthinking is not a strategy, darling).
            </p>
            <p>
              Think of this as your appetizer, not the main course. The free stuff shows you where your hot mess is blooming — it's not designed to solve all your problems, just to lovingly point out where you're spinning your wheels so you can actually do something about it.
            </p>
          </div>
        </div>

        <div style={{ ...card }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#FF8C42" }}>BEYOND THE FREE STUFF</h2>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#666" }}>
            <p style={{ marginBottom: "1rem" }}>
              Ready to stop dabbling and start building? My Hot Mess OS agents help you identify your actual niche (not just "I help everyone"), amplify your voice without shouting into the void, connect with community that converts to customers, streamline how you show up everywhere, and finally monetize your brilliance. Think of it as digital marketing chopped into bite-sized pieces you can stack however works for your brain.
            </p>
            <p>
              Need something more custom? Maybe you've got a wild automation idea or want specialized workflows that don't exist in a box? That's where my consulting brain lights up. I'll open my calendar to hear your beautiful chaos and see if we can build something that actually moves the needle for your specific situation.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button onClick={goHome} style={{ ...gradBtn, width: "100%" }}>
            ← Back to Hot Mess OS
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // CONSULTING — Custom Build & Scoping
  // ═══════════════════════════════════════════════════
  if (screen === "consulting") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "5rem 1.5rem 4rem", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: "0 0 2rem", fontFamily: "inherit" }}>← Back to Menu</button>
        
        <div style={{ marginBottom: "2.5rem", textAlign: "center" as const }}>
          <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>
            Custom Solutions
          </div>
          <h1 style={{ 
            fontSize: "2.2rem", 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: "0.75rem",
            color: "#1a1a1a"
          }}>
            Work Directly with KMK
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto" }}>
            Whether you need a custom automation, want to build your own AI agent, or aren't sure if your idea is even possible — here's how we work together.
          </p>
        </div>

        {/* Free Discovery Call */}
        <div style={{ 
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ 
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🎯</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  15-Minute Introduction Call
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Questions about your Hot Mess Chaos Check results? Book a quick intro call. I'll help you understand your archetype, clarify your pillar scores, and answer any questions about what to do next.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666", marginBottom: "1.25rem" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Q&A about your chaos check results</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Understanding your archetype & scores</div>
                  <div>✓ Clarifying your next steps</div>
                </div>
                <a 
                  href="https://calendly.com/kristinamariekendrick/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: "inline-block",
                    ...gradBtn, 
                    padding: "0.85rem 1.75rem",
                    textDecoration: "none",
                    fontSize: "1rem"
                  }}
                >
                  Book Introduction Call →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Scoping Session */}
        <div style={{ 
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ 
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>📐</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                    Scoping Session
                  </h2>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#44AAFF" }}>$297</span>
                </div>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Book a 45-60 minute deep-dive and I'll map out exactly what's possible, what it'll cost, and whether you should build it or shelf it. You'll get a written scope doc — your roadmap for what happens next.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666", marginBottom: "1.25rem" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ 45-60 minute deep-dive session</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Written scope document delivered</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Timeline & cost estimate</div>
                  <div>✓ Credits toward build if we proceed</div>
                </div>
                <a
                  href="https://calendly.com/kristinamariekendrick/hot-mess-os-scoping-session"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: "inline-block",
                    ...gradBtn, 
                    padding: "0.85rem 1.75rem",
                    textDecoration: "none",
                    fontSize: "1rem",
                  }}
                >
                Book Scoping Session — $297
              </a>
              <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.75rem", fontStyle: "italic" }}>
                Fee credits toward your custom build if we proceed
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Custom Build */}
        <div style={{ 
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
        }}>
          <div style={{ 
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🏗️</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  Custom Build
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  After your scoping session, we'll have a clear quote for your custom automation, AI agent, workflow system, or whatever beautiful chaos you're building. The scoping fee credits toward your build.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Quoted based on scoping session</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Scoping fee ($297) credits toward build</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Direct access to KMK throughout</div>
                  <div>✓ Handoff documentation included</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button onClick={goHome} style={{ ...gradBtn, width: "100%" }}>
            ← Back to Hot Mess OS
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // PRE-BUILT AGENTS — Digital Marketing Mini Apps
  // ═══════════════════════════════════════════════════
  if (screen === "agents") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "5rem 1.5rem 4rem", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: "0 0 2rem", fontFamily: "inherit" }}>← Back to Menu</button>
        
        <div style={{ marginBottom: "2.5rem", textAlign: "center" as const }}>
          <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>
            Pre-Built Agents
          </div>
          <h1 style={{ 
            fontSize: "2.2rem", 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: "0.75rem",
            color: "#1a1a1a"
          }}>
            Plug & Play Digital Systems
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto" }}>
            AI-powered mini apps that handle the digital marketing tasks you're tired of winging. Each one is a standalone tool you can use immediately — no setup, no overwhelm, just results.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div style={{
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "5px",
            padding: "2rem",
            textAlign: "center" as const,
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🚀</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
              Launching Soon
            </div>
            <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              These agents are currently in development. Sign up below to receive updates and share feedback with the Hot Mess OS community.
            </p>
            <button
              onClick={() => {
                alert(`Thanks for your interest! We'll send updates to ${user?.email}`);
              }}
              style={{
                ...gradBtn,
                padding: "0.85rem 1.75rem",
                fontSize: "1rem",
              }}
            >
              ✓ Sign Up for Updates
            </button>
            <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.75rem" }}>
              Updates will be sent to {user?.email}
            </p>
          </div>
        </div>

        {/* Niche Finder Agent */}
        <div style={{
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🎯</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  Niche Finder Agent
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Stop saying "I help everyone" and actually define who you serve. This agent interviews you, analyzes market gaps, and delivers 3-5 viable niche options with real positioning statements you can use today.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Market gap analysis</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Competitor positioning review</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ 3-5 viable niche recommendations</div>
                  <div>✓ Copy-paste positioning statements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Amplifier Agent */}
        <div style={{
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>📢</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  Voice Amplifier Agent
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Stop regurgitating generic takes. This agent scrapes trending articles, fresh content, and emerging ideas across your niche — then challenges you to form your own perspective. It turns your genuine reactions into content ideas that actually sound like you.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Curated trending content in your niche</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Perspective prompts to develop your take</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Voice analysis & consistency scoring</div>
                  <div>✓ Converts your ideas into content formats</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Keyword Agent */}
        <div style={{
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🔍</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  SEO Keyword Strategy Agent
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Stop guessing what keywords to target. This agent researches search volume, competition, and intent for your niche — then builds you a keyword strategy that actually drives traffic you can convert.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Keyword research & volume analysis</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Competition & difficulty scoring</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Search intent mapping</div>
                  <div>✓ Content topic recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Calendar Agent */}
        <div style={{
          background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
          border: "2px solid rgba(68,170,255,0.3)",
          borderRadius: "6px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "5px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>📅</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  Content Calendar Agent
                </h2>
                <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Planning content shouldn't take longer than creating it. This agent builds you a 30-90 day content calendar with topics, angles, creative briefs, and posting schedules tailored to your platform and goals.
                </p>
                <div style={{ fontSize: "0.95rem", color: "#666" }}>
                  <div style={{ marginBottom: "0.4rem" }}>✓ 30-90 day content roadmap</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Creative briefs per post</div>
                  <div style={{ marginBottom: "0.4rem" }}>✓ Platform-optimized scheduling</div>
                  <div>✓ Seasonal & trend integration</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ marginTop: "2.5rem", textAlign: "center" as const }}>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Already signed up? Share your feedback and help shape what gets built first in the Hot Mess OS community.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <button onClick={goHome} style={{ ...gradBtn, width: "100%", background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)" }}>
              ← Back to Hot Mess OS
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // QUIZ GATE — shown when limit is hit BEFORE quiz
  // ═══════════════════════════════════════════════════
  if (screen === "quiz_gate") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: "460px", width: "100%", textAlign: "center" as const }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🧱</div>
          <div style={{ ...label, textAlign: "center" as const, marginBottom: "1rem" }}>Quiz limit reached</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "1rem", color: "#1a1a1a" }}>
            You've already taken the free quiz this week.
          </h2>
          <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            The free readiness check is a one-time weekly peek into the OS. 
            You've already got your archetype and your mess level. The next step isn't retaking — 
            it's <em style={{ color: "#FF4ECD" }}>acting on it</em>.
          </p>

          {quizResults && (
            <div style={{
              background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
              border: "2px solid rgba(68,170,255,0.3)",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1.5rem",
            }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "5px",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                textAlign: "left" as const,
              }}>
                <span style={{ fontSize: "2rem" }}>{archetypes[quizResults.archetype]?.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, color: quizResults.meter.color, fontSize: "0.95rem" }}>{quizResults.meter.label}</div>
                  <div style={{ color: "#666", fontSize: "0.8rem" }}>{quizResults.archetype} · {quizResults.score.toFixed(1)}/5</div>
                </div>
                <button onClick={() => setScreen("quiz_results")} style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(255,140,66,0.3)", borderRadius: "3px", padding: "0.4rem 0.8rem", color: "#FF8C42", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>View report →</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button style={upgradeBtn}>
              Unlock the Full Paid Diagnostic 💅
            </button>
            <p style={{ color: "#666", fontSize: "0.75rem", lineHeight: 1.5 }}>
              30-day strategic action plan · deep pillar analysis · systems & agents support
            </p>
            <button onClick={goHome} style={{ ...btn(), width: "100%", marginTop: "0.5rem" }}>
              ← Back to Hot Mess OS
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // EMAIL COLLECTION — shown before quiz starts
  // ═══════════════════════════════════════════════════
  if (screen === "quiz_email") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: "480px", width: "100%", ...card }}>
          <div style={{ textAlign: "center" as const, marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📧</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem", color: "#1a1a1a" }}>
              Quick info before we start
            </h2>
            <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Drop your email so I can send your results + what's next.
            </p>
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#666", fontSize: "0.85rem", fontWeight: 600 }}>
              Email address
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                background: "rgba(8,8,8,0.8)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "6px",
                color: "#1a1a1a",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(255,140,66,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          <button onClick={handleEmailSubmit} style={{ ...gradBtn, width: "100%", marginBottom: "0.75rem" }}>
            Continue to Quiz →
          </button>
          
          <button onClick={goHome} style={{ ...btn(), width: "100%", background: "none", border: "1px solid rgba(0,0,0,0.08)", color: "#666" }}>
            ← Back
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // QUIZ HISTORY — show all past quiz results
  // ═══════════════════════════════════════════════════
  if (screen === "quiz_history") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "5rem 1.5rem 4rem", maxWidth: "700px", margin: "0 auto" }}>
        <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: "0 0 1.5rem", fontFamily: "inherit" }}>← Back to Menu</button>
        
        <div style={{ textAlign: "center" as const, marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>
            Quiz History
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#1a1a1a" }}>
            Your Diagnostic Journey
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.75rem" }}>
            Track your progress week over week
          </p>
        </div>

        {quizHistory.length === 0 ? (
          <div style={{ ...card, textAlign: "center" as const, padding: "3rem 2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              No quiz history yet. Take your first diagnostic to start tracking your journey.
            </p>
            <button onClick={handleQuizClick} style={{ ...gradBtn, padding: "0.8rem 2rem" }}>
              Take the Quiz
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {quizHistory.map((quiz, idx) => {
              const date = new Date(quiz.created_at);
              const isLatest = idx === 0;
              return (
                <div key={quiz.id} style={{
                  background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
                  border: "2px solid rgba(68,170,255,0.3)",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  position: "relative" as const,
                }}>
                  <div style={{
                    background: "#ffffff",
                    borderRadius: "5px",
                    padding: isLatest ? "2rem 1.5rem 1.5rem" : "1.5rem",
                    position: "relative" as const,
                  }}>
                    {isLatest && (
                      <div style={{ position: "absolute" as const, top: "1rem", left: "1rem", background: "rgba(68,255,136,0.1)", border: "1px solid rgba(68,255,136,0.3)", borderRadius: "3px", padding: "3px 8px", fontSize: "0.7rem", color: "#44FF88", letterSpacing: "0.05em", fontWeight: 700 }}>
                        LATEST
                      </div>
                    )}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "2.5rem" }}>{archetypes[quiz.archetype]?.emoji || "🎨"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: getMeter(quiz.score).color, fontSize: "1.1rem", marginBottom: "0.4rem" }}>
                        {quiz.meter_label}
                      </div>
                      <div style={{ color: "#666", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                        {quiz.archetype} · {quiz.score.toFixed(1)}/5
                      </div>
                      <div style={{ color: "#666", fontSize: "0.85rem" }}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setQuizResults({
                          score: quiz.score,
                          meter: getMeter(quiz.score),
                          archetype: quiz.archetype,
                          pillarAvg: {
                            presence: quiz.pillar_presence,
                            digital_self: quiz.pillar_digital_self,
                            relationships: quiz.pillar_relationships,
                            creative_flow: quiz.pillar_creative_flow,
                          },
                          report: quiz.report || "",
                        });
                        setScreen("quiz_results");
                      }}
                      style={{ background: "none", border: "1px solid rgba(255,140,66,0.3)", borderRadius: "3px", padding: "0.6rem 1rem", color: "#FF8C42", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const, flexShrink: 0 }}
                    >
                      View Report →
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", fontSize: "0.7rem" }}>
                    {Object.keys({ presence: quiz.pillar_presence, digital_self: quiz.pillar_digital_self, relationships: quiz.pillar_relationships, creative_flow: quiz.pillar_creative_flow }).map(k => (
                      <div key={k}>
                        <div style={{ color: "#666", marginBottom: "2px", fontSize: "0.65rem", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                          {pillarLabels[k].split(' ')[0]}
                        </div>
                        <div style={{ fontWeight: 700, color: pillarColors[k] }}>
                          {((quiz as any)[`pillar_${k}`] as number).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back button at bottom */}
        {quizHistory.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <button onClick={goHome} style={{ ...gradBtn, width: "100%" }}>
              ← Back to Main Menu
            </button>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // ENTRY
  // ═══════════════════════════════════════════════════
  if (screen === "entry") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center" as const, marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "1rem" }}>
            AI-Powered Chaos Management
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 50%, #FF8C42 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.75rem",
          }}>
            HOT MESS OS
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            What are we fixing today?
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Chat intro section */}
          <div style={{ 
            padding: "1.5rem",
            background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
            border: "2px solid rgba(68,170,255,0.3)",
            borderRadius: "6px",
          }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>Chat with Your Digital Chaos Wrangler</h2>
              <p style={{ fontSize: "1rem", color: "#ffffff", lineHeight: 1.6, opacity: 0.95 }}>
                You get 10 messages per day per mode — because overthinking isn't a strategy, darling.
              </p>
            </div>

            {/* Chat modes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { key: "chat", icon: "🔍", label: "Fix my hot mess", sub: "Let's figure out what's actually going on" },
                { key: "dumpster", icon: "🚒", label: "Help me put out a dumpster fire", sub: "Something is broken or on fire right now" },
                { key: "roast", icon: "🐛", label: "Roast my bugs & give a patch", sub: "Tear it down, then build it back better" },
                { key: "sprint", icon: "⚡", label: "Spin up a mini-sprint", sub: "Get unstuck and moving in one session" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => startChat(opt.key)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.9)",
                    borderRadius: "5px",
                    padding: "1rem 1.25rem",
                    color: "#1a1a1a",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    transition: "transform 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span style={{ fontSize: "1.5rem" }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{opt.label}</div>
                    <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px", letterSpacing: "0.02em" }}>{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
            <span style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "0.05em" }}>Go Deeper</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
          </div>

          {/* Paid Diagnostic Section */}
          <div style={{ 
            padding: "1.5rem",
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
            border: "2px solid rgba(255,140,66,0.3)",
            borderRadius: "6px",
          }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>
                Complete Readiness Diagnostic
              </h2>
              <p style={{ fontSize: "1rem", color: "#ffffff", lineHeight: 1.6, opacity: 0.95 }}>
                Go beyond the free chaos check. Get a comprehensive 17-section report with personalized growth roadmap, bottleneck diagnosis, and AI positioning strategy. <span style={{ fontWeight: 700 }}>$47 one-time</span>
              </p>
            </div>

            <button
              onClick={handleResumeDiagnostic}
              disabled={checkoutLoading}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: "5px",
                padding: "1rem 1.25rem",
                color: "#1a1a1a",
                cursor: checkoutLoading ? "wait" : "pointer",
                textAlign: "left" as const,
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                transition: "transform 0.15s",
                fontFamily: "inherit",
                opacity: checkoutLoading ? 0.7 : 1,
                width: "100%",
              }}
              onMouseEnter={(e) => !checkoutLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => !checkoutLoading && (e.currentTarget.style.transform = "translateY(0)")}
            >
              <span style={{ fontSize: "1.5rem" }}>📊</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  {checkoutLoading ? "Loading..." : "Get Your $47 Diagnostic Report"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px", letterSpacing: "0.02em" }}>
                  Deep-dive assessment with transformation roadmap
                </div>
              </div>
            </button>
          </div>

          {/* Quiz section - matching chat layout */}
          <div style={{ 
            padding: "1.5rem",
            background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
            border: "2px solid rgba(68,170,255,0.3)",
            borderRadius: "6px",
          }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>Hot Mess Chaos Check</h2>
              <p style={{ fontSize: "1rem", color: "#ffffff", lineHeight: 1.6, opacity: 0.95 }}>
                This free assessment reveals what flavor your hot mess takes in the digital world — and exactly where to focus first. <span style={{ color: "#ffffff" }}>1× per week · Takes 3 minutes</span>
              </p>
            </div>

            {/* Quiz button and history */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                onClick={handleQuizClick}
                disabled={gateLoading}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: "5px",
                  padding: "1rem 1.25rem",
                  color: "#1a1a1a",
                  cursor: gateLoading ? "wait" : "pointer",
                  textAlign: "left" as const,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  transition: "transform 0.15s",
                  fontFamily: "inherit",
                  opacity: gateLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !gateLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => !gateLoading && (e.currentTarget.style.transform = "translateY(0)")}
              >
                <span style={{ fontSize: "1.5rem" }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {gateLoading ? "Checking your session…" : "Take Free Assessment"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px", letterSpacing: "0.02em" }}>
                    Find out which pillar needs attention first
                  </div>
                </div>
              </button>

              {/* Quiz history button */}
              {quizHistory.length > 0 && (
                <button
                  onClick={viewQuizHistory}
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.9)",
                    borderRadius: "5px",
                    padding: "1rem 1.25rem",
                    color: "#1a1a1a",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    transition: "transform 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span style={{ fontSize: "1.5rem" }}>📊</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>View Quiz History</div>
                    <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px", letterSpacing: "0.02em" }}>
                      {quizHistory.length} past {quizHistory.length === 1 ? 'assessment' : 'assessments'}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Section Break - Ready to Invest */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0 1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
            <span style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "0.05em" }}>Ready to Invest?</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.1)" }} />
          </div>

          {/* Premium Options Card */}
          <div style={{
            background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
            border: "2px solid rgba(68,170,255,0.3)",
            borderRadius: "6px",
            padding: "1.5rem 1.25rem",
          }}>
              <h2 style={{ 
                fontSize: "1.5rem", 
                fontWeight: 800, 
                color: "#ffffff",
                textAlign: "left" as const,
                marginBottom: "0.5rem",
              }}>
                Stop Winging It, Start Winning It
              </h2>
              <p style={{
                fontSize: "1rem",
                color: "#ffffff",
                textAlign: "left" as const,
                marginBottom: "1.25rem",
                lineHeight: 1.6,
                opacity: 0.95,
              }}>
                Premium pathways for the serious hot mess ready to level up
              </p>

              {/* Paid Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Paid Diagnostic */}
                <button
                  style={{
                    ...btn(),
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.9)",
                    color: "#1a1a1a",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  💅 Paid Diagnostic — Full Roadmap + 30-Day Plan
                </button>

                {/* Pre-built Agents */}
                <button
                  onClick={() => setScreen("agents")}
                  style={{
                    ...btn(),
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.9)",
                    color: "#1a1a1a",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  🤖 Pre-Built Agents — Plug & Play Digital Systems
                </button>

                {/* Custom Build / Consulting */}
                <button
                  onClick={() => setScreen("consulting")}
                  style={{
                    ...btn(),
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.9)",
                    color: "#1a1a1a",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  🏗️ Custom Build or Consulting — Work Directly with KMK
                </button>
              </div>
            </div>

          {/* User info & logout */}
          <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: "#666" }}>Logged in as {user?.email}</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline", fontFamily: "inherit" }}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════
  if (screen === "chat") {
    const modeLabels: Record<string, string> = {
      chat: "Fix My Hot Mess",
      dumpster: "Dumpster Fire 🚒",
      roast: "Bug Roast 🐛",
      sprint: "Mini-Sprint ⚡",
    };
    return (
      <div style={{ ...pageStyle, display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={grainStyle} />
        <div style={glowStyle} />

        {/* Chat header */}
        <div style={{ ...contentStyle, padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(8,8,8,0.9)", backdropFilter: "blur(12px)" }}>
          <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontFamily: "inherit" }}>← Menu</button>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#FF8C42", letterSpacing: "0.04em" }}>
            {modeLabels[chatMode!] || "Hot Mess OS"}
          </span>
          <span style={{ fontSize: "0.7rem", color: chatUsageToday >= CHAT_LIMIT ? "#FF4444" : "#bbb", marginLeft: "auto" }}>
            {chatUsageToday}/{CHAT_LIMIT} messages today
          </span>
          {quizResults && (
            <span style={{ fontSize: "0.7rem", color: "#44FF88", background: "rgba(68,255,136,0.06)", border: "1px solid rgba(68,255,136,0.15)", padding: "2px 8px", borderRadius: "3px", letterSpacing: "0.04em" }}>
              {archetypes[quizResults.archetype]?.emoji} quiz context active
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ ...contentStyle, flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg, i) => {
            const isAI = msg.role === "assistant";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end" }}>
                <div style={{
                  maxWidth: "82%",
                  background: isAI ? "rgba(0,0,0,0.04)" : "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
                  border: isAI ? "1px solid rgba(0,0,0,0.08)" : "none",
                  borderRadius: isAI ? "2px 12px 12px 12px" : "12px 2px 12px 12px",
                  padding: "0.8rem 1rem",
                  fontSize: "0.88rem",
                  lineHeight: 1.7,
                  color: isAI ? "#1a1a1a" : "#ffffff",
                  whiteSpace: "pre-wrap",
                  fontFamily: isAI ? "'DM Mono', monospace" : "inherit",
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          {chatLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px 12px 12px 12px", padding: "0.8rem 1rem", color: "#666", fontSize: "0.8rem" }}>
                thinking…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ ...contentStyle, padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.6rem", background: "rgba(8,8,8,0.9)", backdropFilter: "blur(12px)" }}>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type your reply…"
            style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "4px", padding: "0.75rem 1rem", color: "#1a1a1a", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || chatLoading}
            style={{ padding: "0.75rem 1.1rem", background: userInput.trim() ? "linear-gradient(90deg,#FF8C42,#FF4ECD)" : "rgba(255,255,255,0.04)", border: "none", borderRadius: "4px", color: userInput.trim() ? "#fff" : "#333", fontWeight: 700, cursor: userInput.trim() ? "pointer" : "not-allowed", fontSize: "0.85rem", fontFamily: "inherit" }}
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════════════════
  if (screen === "quiz") {
    const q = questions[currentQ] as any;
    const progress = Math.round((currentQ / questions.length) * 100);
    return (
      <div style={{ ...pageStyle, display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 1.5rem 4rem" }}>
        <div style={grainStyle} />
        <div style={glowStyle} />
        <SiteNav />
        <div style={{ ...contentStyle, width: "100%", maxWidth: "520px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontFamily: "inherit" }}>← Menu</button>
            <span style={{ color: "#666", fontSize: "0.78rem", letterSpacing: "0.05em" }}>{currentQ + 1} / {questions.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: "3px", background: "rgba(0,0,0,0.1)", borderRadius: "2px", marginBottom: "2.5rem" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#FF8C42,#FF4ECD)", borderRadius: "2px", transition: "width 0.3s ease" }} />
          </div>

          {/* Pillar tag */}
          <div style={{ display: "inline-block", background: `${pillarColors[q.pillar]}11`, border: `1px solid ${pillarColors[q.pillar]}33`, borderRadius: "3px", padding: "2px 10px", fontSize: "0.65rem", color: pillarColors[q.pillar], letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "1rem" }}>
            {pillarLabels[q.pillar]}
          </div>

          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.5, marginBottom: "1.75rem", color: "#1a1a1a" }}>{q.q}</h2>

          {q.type === "single" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem" }}>
              {q.options.map((opt: any, i: number) => {
                const isSel = selectedIdx === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    style={{ background: isSel ? "rgba(255,140,66,0.08)" : "rgba(255,255,255,0.02)", border: isSel ? "1px solid rgba(255,140,66,0.5)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", padding: "0.85rem 1rem", color: isSel ? "#FF8C42" : "#888", cursor: "pointer", textAlign: "left", fontSize: "0.87rem", fontFamily: "inherit", transition: "all 0.12s" }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "scale" && (
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginBottom: "0.75rem" }}>
                {[1, 2, 3, 4, 5].map((v) => {
                  const isSel = selectedIdx === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setSelectedIdx(v)}
                      style={{ width: "52px", height: "52px", borderRadius: "3px", border: isSel ? "1px solid #FF8C42" : "1px solid rgba(255,255,255,0.1)", background: isSel ? "rgba(255,140,66,0.15)" : "rgba(255,255,255,0.02)", color: isSel ? "#FF8C42" : "#555", fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#666", letterSpacing: "0.03em" }}>
                <span>{q.low}</span><span>{q.high}</span>
              </div>
            </div>
          )}

          <button onClick={handleQuizNext} disabled={selectedIdx === null} style={{ width: "100%", padding: "0.9rem", background: selectedIdx !== null ? "linear-gradient(90deg,#FF8C42,#FF4ECD)" : "rgba(255,255,255,0.04)", border: "none", borderRadius: "4px", color: selectedIdx !== null ? "#fff" : "#333", fontWeight: 700, fontSize: "0.9rem", cursor: selectedIdx !== null ? "pointer" : "not-allowed", fontFamily: "inherit", letterSpacing: "0.04em" }}>
            {currentQ + 1 === questions.length ? "Get My Diagnosis 🔥" : "Next →"}
          </button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // QUIZ LOADING
  // ═══════════════════════════════════════════════════
  if (screen === "quiz_loading") return (
    <div style={{ ...pageStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <div style={{ ...contentStyle, textAlign: "center" as const }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔥</div>
        <p style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em", color: "#FF8C42" }}>RUNNING YOUR DIAGNOSTICS</p>
        <p style={{ color: "#666", fontSize: "0.8rem", marginTop: "0.5rem", letterSpacing: "0.03em" }}>Should take under 30 seconds.</p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // QUIZ RESULTS
  // ═══════════════════════════════════════════════════
  if (screen === "quiz_results" && quizResults) {
    const { score, meter, archetype, pillarAvg: pa } = quizResults;
    const sections = parseReport(quizResults.report);
    const arch = archetypes[archetype] || archetypes["Creator"];
    return (
      <div style={{ ...pageStyle, padding: "5rem 1.5rem 4rem" }}>
        <div style={grainStyle} />
        <div style={glowStyle} />
        <SiteNav />
        <div style={{ ...contentStyle, maxWidth: "580px", margin: "0 auto" }}>
          <button onClick={goHome} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8rem", padding: "0 0 1.5rem", fontFamily: "inherit" }}>← Menu</button>

          <div style={{ textAlign: "center" as const, marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>
              Hot Mess Chaos Check
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#1a1a1a" }}>
              Your diagnosis is in. 💅
            </h1>
          </div>

          {/* Score + Archetype */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ ...card, background: meter.bg, border: `1px solid ${meter.color}22`, textAlign: "center" as const }}>
              <div style={label}>Mess Level</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: meter.color }}>{meter.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>{score.toFixed(1)} / 5.0</div>
            </div>
            <div style={{ ...card, textAlign: "center" as const }}>
              <div style={label}>Archetype</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FF4ECD" }}>{arch.emoji} {archetype}</div>
              <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "0.25rem", lineHeight: 1.4 }}>{arch.tagline}</div>
            </div>
          </div>

          {/* Pillar bars */}
          <div style={{ ...card, marginBottom: "1.5rem" }}>
            <div style={label}>Pillar Breakdown</div>
            {Object.keys(pa).map((k) => (
              <div key={k} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
                  <span style={{ color: pillarColors[k], fontWeight: 700 }}>{pillarLabels[k]}</span>
                  <span style={{ color: "#666", fontWeight: 700 }}>{(pa as any)[k].toFixed(1)}</span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                  {pillarDescriptions[k]}
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${((pa as any)[k] / 5) * 100}%`, background: pillarColors[k], borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Report sections */}
          {sections.map((sec, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
              border: "2px solid rgba(68,170,255,0.3)",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "0.75rem",
            }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "5px",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "0.62rem", color: "#FF8C42", textTransform: "uppercase" as const, letterSpacing: "2px", marginBottom: "0.6rem" }}>{sec.title}</div>
                <div style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", whiteSpace: "pre-wrap" }}>{sec.body}</div>
              </div>
            </div>
          ))}

          {/* CTAs */}
          <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button onClick={exportQuizPDF} style={{ ...btn(), width: "100%", background: "rgba(255,140,66,0.08)", border: "1px solid rgba(255,140,66,0.2)", color: "#FF8C42" }}>
              📄 Export as PDF
            </button>
            
            <a
              href="https://calendly.com/kristinamariekendrick/30min"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                ...btn(),
                width: "100%",
                background: "rgba(68,170,255,0.08)",
                border: "1px solid rgba(68,170,255,0.2)",
                color: "#44AAFF",
                textDecoration: "none",
                textAlign: "center" as const,
              }}
            >
              💬 Questions? Book a 15-Min Introduction Call
            </a>
            
            <div style={{ height: "2rem" }} />
            
            <div style={{ ...card, textAlign: "center" as const }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🧾</div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.35rem" }}>Want the full roadmap?</div>
              <div style={{ fontSize: "0.8rem", color: "#666", lineHeight: 1.6, marginBottom: "1rem" }}>
                The complete diagnostic goes deep on all four pillars, gives you a 30-day strategic action plan, and connects you with Hot Mess OS agents who can build the systems you need (or hey, I do custom consulting too if you want the founder treatment).
              </div>
              <button style={upgradeBtn}>Upgrade to Paid Diagnostic 💅</button>
            </div>
            
            <div style={{ height: "1rem" }} />
            
            <button onClick={goHome} style={gradBtn}>← Back to Main Menu</button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════
  if (screen === "error") return (
    <div style={{ ...pageStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "2rem" }}>
      <div style={grainStyle} />
      <div style={{ ...contentStyle, textAlign: "center" as const }}>
        <div style={{ fontSize: "3rem" }}>💀</div>
        <p style={{ fontSize: "1rem", fontWeight: 600, marginTop: "1rem" }}>The OS crashed. Iconic, but inconvenient.</p>
        <p style={{ color: "#666", fontSize: "0.82rem", marginTop: "0.5rem", maxWidth: "340px" }}>{errorMsg}</p>
        <button onClick={goHome} style={{ marginTop: "1.5rem", ...gradBtn, width: "auto", padding: "0.8rem 2rem" }}>Back to Menu</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // PAID DIAGNOSTIC GATE - Payment Page
  // ═══════════════════════════════════════════════════
  if (screen === "paid_diagnostic_gate") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "6rem 1.5rem 4rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center" as const, marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>
              Analyzing Your Digital Chaos
            </div>
            <h1 style={{
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1rem",
              color: "#1a1a1a",
            }}>
              The Full Hot Mess Audit
            </h1>
            <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
              (and how to fix it)
            </p>
          </div>

          {/* Intro Copy */}
          <div style={{ marginBottom: "2.5rem", fontSize: "0.95rem", lineHeight: 1.7, color: "#666", textAlign: "center" as const, maxWidth: "620px", margin: "0 auto 2.5rem" }}>
            Ready to see what your digital presence <em>actually</em> looks like when no one's watching? This isn't another surface-level assessment that tells you to "post more consistently." This is a full forensic analysis of YOU, your business, and how those two hot messes are (or aren't) working together online — where you're killing it, where you're bleeding opportunities, and exactly how ready you are to thrive (not just survive) in the creator economy.
          </div>

          {/* Main Product Card */}
          <div style={{ 
            background: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)",
            border: "2px solid rgba(68,170,255,0.3)",
            borderRadius: "6px",
            padding: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div style={{ 
              background: "#ffffff",
              borderRadius: "5px",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem" }}>📊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                      Creator Economy Readiness Diagnostic
                    </h2>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#44AAFF" }}>$47</span>
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.5, margin: 0 }}>
                    Where you're killing it, where you're bleeding opportunities, and exactly how ready you are to thrive (not just survive) in the creator economy.
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div style={{ fontSize: "0.92rem", color: "#666", marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ 17-section reality check report</strong> — Every corner of your digital presence, analyzed and decoded</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ The gap analysis that stings a little</strong> — How you see yourself vs. how the internet sees you (prepare for some eye-opening moments)</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Your ONE bottleneck diagnosed</strong> — The constraint holding everything else back (Theory of Constraints approach — not a laundry list)</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Custom 30/90/365-day roadmap</strong> — Designed around your actual life constraints, not fantasy schedules</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Tool stack intervention</strong> — What's working, what's digital clutter, and what you actually need</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Content DNA breakdown</strong> — Your natural themes revealed through word cloud magic</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ AI displacement reality check</strong> — Based on Anthropic research: where you're vulnerable, where you're defensible, how to adapt</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Competitive intel that matters</strong> — Where you stand, where the white space is, what you're underselling</div>
                <div style={{ marginBottom: "0.4rem" }}><strong style={{ fontWeight: 700 }}>✓ Creator economy readiness score (0-100)</strong> — Are you positioned to capitalize or just contributing to the noise?</div>
                <div><strong style={{ fontWeight: 700 }}>✓ Interactive results + downloadable PDF</strong> — So you can revisit your roadmap without hunting through emails</div>
              </div>

              {/* CTA Button */}
              <button
                onClick={async () => {
                  setCheckoutLoading(true);
                  try {
                    const res = await fetch("/api/checkout-diagnostic", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                        email: user?.email, 
                        userId: user?.id 
                      }),
                    });
                    
                    if (!res.ok) {
                      throw new Error(`HTTP ${res.status}`);
                    }
                    
                    const data = await res.json();
                    
                    if (data.error) {
                      alert(data.error);
                      setCheckoutLoading(false);
                      return;
                    }
                    
                    if (data.url) {
                      // Redirect to Stripe
                      window.location.href = data.url;
                    }
                  } catch (err) {
                    console.error("Checkout error:", err);
                    alert("Something went wrong. Please try again or contact support.");
                    setCheckoutLoading(false);
                  }
                }}
                disabled={checkoutLoading}
                style={{
                  ...gradBtn,
                  width: "100%",
                  fontSize: "1.05rem",
                  padding: "1.15rem",
                  opacity: checkoutLoading ? 0.6 : 1,
                  cursor: checkoutLoading ? "wait" : "pointer",
                }}
              >
                {checkoutLoading ? "Redirecting to checkout..." : "Start Your Diagnostic →"}
              </button>
            </div>
          </div>

          {/* What Makes This Different */}
          <div style={{ ...card, marginBottom: "2rem", background: "rgba(255,255,255,0.5)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "#1a1a1a" }}>
              What makes this different from the free chaos check?
            </h3>
            <div style={{ fontSize: "0.92rem", color: "#666", lineHeight: 1.6 }}>
              <p style={{ marginBottom: "0.75rem" }}>The free quiz gives you pillar scores and a vibe check. This gives you <strong>the forensic breakdown</strong>.</p>
              <p style={{ marginBottom: "0.75rem" }}>We analyze your actual digital footprint — your website, profiles, content samples, competitor landscape, business model, constraints, and hidden strengths — then connect the dots between <strong>who you are</strong> (identity, capacity, beliefs) and <strong>what you've built</strong> (offer, presence, systems).</p>
              <p style={{ margin: 0 }}>You get a personalized transformation blueprint that accounts for your real life (time, budget, working style) — not generic advice that assumes you have unlimited capacity and a team of five.</p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setScreen("entry")}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              display: "block",
              margin: "0 auto",
              textDecoration: "underline",
            }}
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // PAID DIAGNOSTIC - Profile Setup (Coming Soon)
  // ═══════════════════════════════════════════════════
  // Video Transition
if (showVideoTransition) {
  return (
    <VideoTransition
      title={videoTransitionConfig.title}
      description={videoTransitionConfig.description}
      onContinue={() => {
        setShowVideoTransition(false);
        setScreen(videoTransitionConfig.nextScreen);
      }}
    />
  );
}

if (screen === "paid_diagnostic_profile") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "6rem 1.5rem 4rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" as const }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Payment Successful!</h1>
          <div style={{ ...card }}>
            <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "2rem" }}>
              Profile setup form coming in Phase 2...
            </p>
            <button onClick={() => setScreen("entry")} style={gradBtn}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // Profile Confirmation — review saved profile before Business Deep Dive
if (screen === 'paid_diagnostic_profile_confirm') {
  return (
    <ProfileConfirmation
      userEmail={user?.email || ''}
      onConfirm={() => {
        setScreen('paid_diagnostic_business');
      }}
      onEdit={() => {
        sessionStorage.setItem('editProfile', 'true');
        setScreen('paid_diagnostic_profile');
      }}
      onSaveAndExit={() => {
        setScreen('entry');
      }}
    />
  );
}

  // Other diagnostic steps
if (screen === 'paid_diagnostic_business') {
  return (
<BusinessDeepDive
  userEmail={user?.email || ''}
onComplete={(data) => {
  setBusinessDeepDiveData(data);
  
  // Show video transition before pillars
  setVideoTransitionConfig({
    title: 'Ready for Your Pillar Assessment?',
    description: 'Next, we\'ll dive into 4 key areas that determine your creator readiness: Presence, Digital Self, Relationships, and Creative Flow. This will take about 15 minutes.',
    nextScreen: 'paid_diagnostic_pillars'
  });
  setShowVideoTransition(true);
}}
onBack={() => {
  setScreen('paid_diagnostic_profile_confirm');
}}
onSaveAndExit={() => {
  setScreen('entry');
}}
/>
  );
}

// Pillar Assessment
if (screen === "paid_diagnostic_pillars") {
  return (
    <PillarAssessment
      userEmail={user?.email || ''}
      onComplete={(data) => {
        console.log('✅ Pillar assessment complete:', data);
        setScreen('paid_diagnostic_loading');
      }}
      onBack={() => {
        setScreen('paid_diagnostic_business');
      }}
      onSaveAndExit={() => {
        setScreen('entry');
      }}
    />
  );
}

  if (screen === "paid_diagnostic_loading") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "6rem 1.5rem 4rem", minHeight: "100vh", textAlign: "center" as const }}>
        <h1>Generating Your Report... (Coming Soon)</h1>
        <button onClick={() => setScreen("entry")} style={gradBtn}>Back</button>
      </div>
      <SiteFooter />
    </div>
  );

  if (screen === "paid_diagnostic_report") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "6rem 1.5rem 4rem", minHeight: "100vh", textAlign: "center" as const }}>
        <h1>Your Diagnostic Report (Coming Soon)</h1>
        <button onClick={() => setScreen("entry")} style={gradBtn}>Back</button>
      </div>
      <SiteFooter />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // PROFILE SETUP - After signup (skippable)
  // ═══════════════════════════════════════════════════
  if (screen === "profile_setup") return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      <SiteNav />
      <div style={{ ...contentStyle, padding: "6rem 1.5rem 4rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          
          {/* Welcome Message */}
          <div style={{ textAlign: "center" as const, marginBottom: "2rem" }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: 900,
              marginBottom: "1rem",
              color: "#1a1a1a",
            }}>
              Welcome to Hot Mess OS! 🎉
            </h1>
            <p style={{ fontSize: "1rem", color: "#666", marginBottom: "1.5rem" }}>
              Let's set up your profile to personalize your experience.
            </p>
            <button
              onClick={() => setScreen("entry")}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "0.95rem",
                textDecoration: "underline",
                fontFamily: "inherit",
              }}
            >
              Skip for now →
            </button>
          </div>

{/* Profile Setup Form */}
<ProfileSetup
  email={user?.email || ""}
onComplete={async () => {
  if (user?.id) {
    await loadUserData(user.id);
  }
  
  const editMode = sessionStorage.getItem('editProfile');
  sessionStorage.removeItem('editProfile');
  console.log("🧹 Cleared editProfile flag:", editMode);
  
  // If editing from account, go back to account
if (editMode === 'true') {
    setScreen('paid_diagnostic_profile_confirm');
  } else {
    setScreen('paid_diagnostic_profile_confirm');
  }
}}
/>
        </div>
      </div>
      <SiteFooter />
    </div>
  );


  return null;
}