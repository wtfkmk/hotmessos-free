import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { scorePillars, buildReportPrompt } from "@/lib/scoring";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Rate limit: 1 free quiz per IP per day
async function checkRateLimit(ip: string): Promise<boolean> {
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("count")
    .eq("ip", ip)
    .eq("action", "quiz")
    .gte("window_start", windowStart.toISOString())
    .maybeSingle(); // won't throw if no row found

  if (error) return true; // fail open on DB errors
  if (data && data.count >= 1) return false; // limit hit
  return true;
}

async function incrementRateLimit(ip: string) {
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("id, count")
    .eq("ip", ip)
    .eq("action", "quiz")
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
      .insert({ ip, action: "quiz", count: 1, window_start: windowStart.toISOString() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "localhost";
    const ip = rawIp.split(",")[0].trim(); // take first IP if multiple
    const { answers, email } = await req.json();

    // Rate limit check
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "You've used your free quiz for today. Come back tomorrow or upgrade to the paid diagnostic." },
        { status: 429 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55 second timeout
    const { pillarAvg, score, meter, archetype } = scorePillars(answers);

    // Generate report via Anthropic (server-side only)
    const prompt = buildReportPrompt(answers, pillarAvg, score, meter, archetype);
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const report =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save report to Supabase
    const { data: savedReport, error } = await supabaseAdmin
      .from("reports")
      .insert({
        email: email || null,
        answers,
        pillar_avg: pillarAvg,
        score,
        meter: meter.label,
        archetype,
        report,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Increment rate limit
    await incrementRateLimit(ip);

    return NextResponse.json({
      reportId: savedReport.id,
      score,
      meter,
      archetype,
      pillarAvg,
      report,
    });
  } catch (err: any) {
    console.error("Diagnose error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}