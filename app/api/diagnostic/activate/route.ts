// app/api/diagnostic/activate/route.ts
// Called from /diagnostic/onboarding after successful Stripe payment.
// Links the paid_diagnostics record (found by stripe_session_id) to the
// authenticated user's user_id. This handles the race condition where the
// Stripe webhook hasn't fired yet when the user lands on the success page.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    const { stripeSessionId } = await req.json();

    if (!stripeSessionId) {
      return NextResponse.json({ error: "stripeSessionId required" }, { status: 400 });
    }

    // Verify with Stripe that the session is actually paid
    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    // Find the diagnostic record by stripe_session_id
    const { data: existing } = await supabaseAdmin
      .from("paid_diagnostics")
      .select("id, user_id")
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();

    if (existing) {
      // Update the record with user_id (idempotent — safe to call multiple times)
      await supabaseAdmin
        .from("paid_diagnostics")
        .update({
          user_id: user.id,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Webhook hasn't created the record yet — create it now
      await supabaseAdmin
        .from("paid_diagnostics")
        .insert({
          user_id: user.id,
          email: user.email,
          stripe_session_id: stripeSessionId,
          stripe_payment_intent: stripeSession.payment_intent as string,
          status: "pending",
          amount_paid: stripeSession.amount_total || 4700,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Activate diagnostic error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate diagnostic" },
      { status: 500 }
    );
  }
}
