import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { email, reportId, productType } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Handle paid diagnostic (new product)
    if (productType === "paid_diagnostic") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_DIAGNOSTIC!,
            quantity: 1,
          },
        ],
        metadata: {
          productType: "paid_diagnostic",
          email: email || "",
        },
        success_url: `${appUrl}/diagnostic/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/diagnostic`,
      });

      return NextResponse.json({ url: session.url });
    }

    // Handle existing report upgrade flow
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        reportId: reportId || "",
        email: email || "",
      },
      success_url: `${appUrl}/results/${reportId}?upgraded=true`,
      cancel_url: `${appUrl}/results/${reportId}?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}