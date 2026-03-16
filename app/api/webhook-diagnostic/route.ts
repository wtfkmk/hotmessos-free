// app/api/webhook-diagnostic/route.ts
// Handles Stripe webhook events for paid diagnostic purchases

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.product === "paid_diagnostic") {
          await handleDiagnosticPurchase(session);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        
        // Update diagnostic status to failed
        if (paymentIntent.metadata?.diagnostic_id) {
          await supabase
            .from("paid_diagnostics")
            .update({ status: "failed" })
            .eq("id", paymentIntent.metadata.diagnostic_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleDiagnosticPurchase(session: Stripe.Checkout.Session) {
  const email = session.customer_email || session.metadata?.email;
  
  if (!email) {
    console.error("No email in session metadata");
    return;
  }

  // Find or create diagnostic record
  const { data: diagnostic, error: fetchError } = await supabase
    .from("paid_diagnostics")
    .select("*")
    .eq("stripe_session_id", session.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = not found (expected if record doesn't exist)
    console.error("Error fetching diagnostic:", fetchError);
  }

  if (diagnostic) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("paid_diagnostics")
      .update({
        status: "pending", // Will be "processing" when they start, "completed" when done
        stripe_payment_intent: session.payment_intent as string,
        amount_paid: session.amount_total || 4700,
      })
      .eq("id", diagnostic.id);

    if (updateError) {
      console.error("Error updating diagnostic:", updateError);
    } else {
      console.log(`Diagnostic ${diagnostic.id} marked as paid`);
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from("paid_diagnostics")
      .insert({
        email,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        status: "pending",
        amount_paid: session.amount_total || 4700,
      });

    if (insertError) {
      console.error("Error creating diagnostic:", insertError);
    } else {
      console.log(`New diagnostic created for ${email}`);
    }
  }

  // Optional: Send welcome email here
  // await sendDiagnosticWelcomeEmail(email);
}