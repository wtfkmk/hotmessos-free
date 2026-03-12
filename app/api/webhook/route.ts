import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});
const resend = new Resend(process.env.RESEND_API_KEY!);

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
    const { reportId, email } = session.metadata || {};

    // Mark report as paid
    if (reportId) {
      await supabaseAdmin
        .from("reports")
        .update({ is_paid: true })
        .eq("id", reportId);

      // Save purchase record
      await supabaseAdmin.from("purchases").insert({
        email: email || null,
        stripe_session_id: session.id,
        report_id: reportId,
        amount: session.amount_total || 4700,
      });
    }

    // Send confirmation email
    if (email) {
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

  return NextResponse.json({ received: true });
}