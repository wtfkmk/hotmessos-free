import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { buildChatSystemPrompt } from "@/lib/scoring";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Rate limit: 20 chat messages per IP per day
async function checkChatRateLimit(ip: string): Promise<boolean> {
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("count")
    .eq("ip", ip)
    .eq("action", "chat")
    .gte("window_start", windowStart.toISOString())
    .maybeSingle();

  if (error) return true;
  if (data && data.count >= 20) return false;
  return true;
}

async function incrementChatRateLimit(ip: string) {
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const { data } = await supabaseAdmin
    .from("rate_limits")
    .select("id, count")
    .eq("ip", ip)
    .eq("action", "chat")
    .gte("window_start", windowStart.toISOString())
    .maybeSingle();

  if (data) {
    await supabaseAdmin
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("id", data.id);
  } else {
    await supabaseAdmin
      .from("rate_limits")
      .insert({ ip, action: "chat", count: 1, window_start: windowStart.toISOString() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "localhost";
    const ip = rawIp.split(",")[0].trim();
    const { messages, mode, reportId } = await req.json();

    // Rate limit check
    const allowed = await checkChatRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "You've hit your 20 free messages for today. Come back tomorrow or upgrade for unlimited access." },
        { status: 429 }
      );
    }

    // Load quiz context if reportId provided
    let quizContext: string | undefined;
    if (reportId) {
      const { data: report } = await supabaseAdmin
        .from("reports")
        .select("score, meter, archetype, pillar_avg")
        .eq("id", reportId)
        .single();

      if (report) {
        const pa = report.pillar_avg;
        quizContext = `User quiz results — Mess Level: ${report.meter} (${report.score.toFixed(1)}/5). Archetype: ${report.archetype}. Pillar scores — Presence: ${pa.presence.toFixed(1)}, Digital Self: ${pa.digital_self.toFixed(1)}, Relationships: ${pa.relationships.toFixed(1)}, Creative Flow: ${pa.creative_flow.toFixed(1)}. Use this to personalise every response.`;
      }
    }

    const systemPrompt = buildChatSystemPrompt(mode, quizContext);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Increment rate limit
    await incrementChatRateLimit(ip);

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}