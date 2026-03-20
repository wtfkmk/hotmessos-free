import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Verify bearer token and get user identity from it
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { businessDeepDive, markComplete } = await req.json();

    // Check if record exists for this user
    const { data: existing } = await supabaseAdmin
      .from("paid_diagnostics")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let data, error;

    if (existing) {
      const result = await supabaseAdmin
        .from("paid_diagnostics")
        .update({
          business_deep_dive: businessDeepDive,
          business_completed: markComplete === true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabaseAdmin
        .from("paid_diagnostics")
        .insert({
          user_id: user.id,
          email: user.email,
          business_deep_dive: businessDeepDive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save business deep dive data", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
