import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // Save profile
    const { data: profile, error: profileError } = await supabase
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