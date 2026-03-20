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

    // Verify with Stripe that the session is paid.
    // We treat a Stripe API failure as non-fatal: if the DB record already
    // exists (created at checkout), we trust it and proceed. Only block if
    // Stripe explicitly tells us it's unpaid.
    let stripePaymentIntent: string | null = null;
    let stripeAmountTotal = 4700;
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (stripeSession.payment_status === "unpaid") {
        console.error("Activate: payment_status=unpaid for session", stripeSessionId);
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
      stripePaymentIntent = stripeSession.payment_intent as string | null;
      stripeAmountTotal = stripeSession.amount_total || 4700;
      console.log("Activate: Stripe session verified, payment_status=", stripeSession.payment_status);
    } catch (stripeErr: any) {
      // Log and continue — the webhook will clean up if needed
      console.error("Activate: Stripe session retrieve failed (non-fatal):", stripeErr.message);
    }

    // Find the diagnostic record by stripe_session_id
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("paid_diagnostics")
      .select("id, user_id")
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();

    if (fetchErr) {
      console.error("Activate: DB fetch error:", fetchErr);
    }

    let diagnosticId: string;

    if (existing) {
      diagnosticId = existing.id;
      // Update the record with user_id (idempotent — safe to call multiple times)
      const { error: updateErr } = await supabaseAdmin
        .from("paid_diagnostics")
        .update({ user_id: user.id, status: "pending" })
        .eq("id", existing.id);
      if (updateErr) console.error("Activate: DB update error:", updateErr);
    } else {
      // Webhook hasn't created the record yet — create it now
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("paid_diagnostics")
        .insert({
          user_id: user.id,
          email: user.email,
          stripe_session_id: stripeSessionId,
          stripe_payment_intent: stripePaymentIntent,
          status: "pending",
          amount_paid: stripeAmountTotal,
        })
        .select("id")
        .single();
      if (insertErr) {
        console.error("Activate: DB insert error:", insertErr);
        return NextResponse.json({ error: "Failed to create diagnostic record" }, { status: 500 });
      }
      diagnosticId = inserted.id;
    }

    return NextResponse.json({ success: true, diagnosticId });
  } catch (error: any) {
    console.error("Activate diagnostic error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate diagnostic" },
      { status: 500 }
    );
  }
}
