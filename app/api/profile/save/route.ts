import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Verify bearer token
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const {
      email,
      businessModels,
      elevatorPitch,
      teamSize,
      workingStyle,
      monthlyRevenue,
      hoursPerWeek,
      monthlyBudget,
      platforms,
      biggestConstraint,
      primaryGoal,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .upsert(
        {
          email,
          business_models: businessModels,
          elevator_pitch: elevatorPitch,
          team_size: teamSize,
          working_style: workingStyle,
          monthly_revenue: monthlyRevenue,
          hours_per_week: hoursPerWeek,
          monthly_budget: monthlyBudget,
          platforms,
          biggest_constraint: biggestConstraint,
          primary_goal: primaryGoal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Profile save error:", profileError);
      return NextResponse.json(
        { error: "Failed to save profile", details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
