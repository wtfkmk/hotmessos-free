import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { reportId, email, productType } = session.metadata || {};

    // Handle paid diagnostic (NEW)
    if (productType === "paid_diagnostic") {
      // Save purchase record
      await supabaseAdmin.from("purchases").insert({
        email: email || session.customer_email,
        stripe_session_id: session.id,
        report_id: null, // Will be created after onboarding
        amount: session.amount_total || 4700,
      });

      // Send confirmation email
      if (email && resend) {
        await resend.emails.send({
          from: "Hot Mess OS <noreply@yourdomain.com>",
          to: email,
          subject: "Let's get started on your diagnostic 🔥",
          html: `
            <h2>Payment Confirmed!</h2>
            <p>Thanks for purchasing the Creator Economy Readiness Diagnostic.</p>
            <p>Next step: Complete your onboarding questionnaire to get your personalized analysis.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/diagnostic/onboarding?session_id=${session.id}">Start Onboarding →</a></p>
            <p>— Hot Mess OS</p>
          `,
        });
      }
      
      return NextResponse.json({ received: true });
    }

    // Handle existing report upgrades (EXISTING LOGIC)
    if (reportId) {
      await supabaseAdmin
        .from("reports")
        .update({ is_paid: true })
        .eq("id", reportId);

      await supabaseAdmin.from("purchases").insert({
        email: email || null,
        stripe_session_id: session.id,
        report_id: reportId,
        amount: session.amount_total || 4700,
      });

      if (email && resend) {
        await resend.emails.send({
          from: "Hot Mess OS <noreply@yourdomain.com>",
          to: email,
          subject: "Your Paid Diagnostic is ready 💅",
          html: `
            <h2>Your Hot Mess OS Paid Diagnostic</h2>
            <p>Thanks for upgrading! Your full diagnostic report is ready.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${reportId}?upgraded=true">View your full report →</a></p>
            <p>— Hot Mess OS</p>
          `,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}