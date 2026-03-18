// app/api/checkout-diagnostic/route.ts
// Creates Stripe checkout session for $47 paid diagnostic

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check if user already has an active diagnostic
    const { data: existing } = await supabase
      .from("paid_diagnostics")
      .select("id, status")
      .eq("email", email)
      .in("status", ["pending", "processing", "completed"])
      .single();

    if (existing && existing.status === "completed") {
      return NextResponse.json(
        { error: "You've already purchased a diagnostic" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_DIAGNOSTIC!,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      customer_email: email,
      metadata: {
        email,
        userId: userId || "",
        product: "paid_diagnostic",
      },
    });

    // Create pending diagnostic record
    const { error: insertError } = await supabase
      .from("paid_diagnostics")
      .insert({
        email,
        stripe_session_id: session.id,
        status: "pending",
        amount_paid: 4700,
      });

    if (insertError) {
      console.error("Error creating diagnostic record:", insertError);
      // Don't fail the checkout - webhook will handle it
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}