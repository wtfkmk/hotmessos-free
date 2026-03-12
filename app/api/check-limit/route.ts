import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function getTodayUTC(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function getTomorrowUTC(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}

export async function POST(req: NextRequest) {
  const rawIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "localhost";
  const ip = rawIp.split(",")[0].trim();

  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("count")
    .eq("ip", ip)
    .eq("action", "quiz")
    .gte("window_start", getTodayUTC())
    .lt("window_start", getTomorrowUTC())
    .maybeSingle();

  if (error) return NextResponse.json({ ok: true }); // fail open
  
  if (data && data.count >= 1) {
    return NextResponse.json(
      { error: "You've used your free quiz for today. Come back tomorrow or upgrade to the paid diagnostic." },
      { status: 429 }
    );
  }

  return NextResponse.json({ ok: true });
}