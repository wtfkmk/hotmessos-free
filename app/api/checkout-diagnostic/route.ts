// app/api/checkout-diagnostic/route.ts
// Creates Stripe checkout session for $47 paid diagnostic

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Guarantee an absolute URL with https:// scheme for Stripe success/cancel URLs.
// NEXT_PUBLIC_APP_URL must be set in Vercel env vars (e.g. https://yourdomain.com).
function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || "";
  // Strip trailing slash for clean URL concatenation
  const clean = raw.replace(/\/$/, "");
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  // If the var is set but missing the scheme, prepend https://
  if (clean) {
    return `https://${clean}`;
  }
  // Last resort fallback — should not be reached if NEXT_PUBLIC_APP_URL is set
  throw new Error(
    "NEXT_PUBLIC_APP_URL is not set. Add it to your Vercel environment variables (e.g. https://yourdomain.com)."
  );
}

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
      success_url: `${getAppUrl()}/diagnostic/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/`,
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