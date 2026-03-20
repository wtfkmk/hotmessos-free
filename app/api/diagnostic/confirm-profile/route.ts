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
    const { data, error } = await supabaseAdmin
      .from("paid_diagnostics")
      .update({
        profile_confirmed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error confirming profile:", error);
      return NextResponse.json({ error: "Failed to confirm profile" }, { status: 500 });
    }

    await supabaseAdmin
      .from("user_profiles")
      .update({
        profile_confirmed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabaseAdmin
      .from("activity_log")
      .insert({
        user_id: user.id,
        email: user.email,
        activity_type: "profile_confirmed",
        activity_title: "Profile Confirmed",
        activity_description: "Confirmed profile information before starting diagnostic",
        section: "profile",
        metadata: { confirmed_at: new Date().toISOString() },
      });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
