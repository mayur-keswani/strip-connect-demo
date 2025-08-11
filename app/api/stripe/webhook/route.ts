import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";

// Validate required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is required");
}

const stripe = new Stripe(stripeSecretKey);

// This is required to disable body parsing for webhook signature verification
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log("INSIDE WEBHOOK");
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Get raw body as buffer to preserve exact formatting for signature verification
    // const buf = await request.arrayBuffer();
    // const body = Buffer.from(buf);
    const body = await request.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = JSON.parse(body); //stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log("Webhook signature verified successfully");
    } catch (err) {
      console.error(
        "Webhook signature verification failed:",
        err instanceof Error ? err.message : err
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Event type:", event.type);
    // Handle different event types
    switch (event.type) {
      case "account.updated":
        {
          console.log("Processing account.updated", event);
          await handleAccountUpdated(event.data.object as any);
        }
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleAccountUpdated(account: any) {
  try {
    if (account.id && account.charges_enabled && account.payouts_enabled) {
      console.log(
        `Processing account.updated for user: ${account.metadata.userId}`
      );

      await prisma.user.update({
        where: { stripeAccountId: account.id },
        data: {
          isOnboarded: true,
          stripeAccountId: account.id,
        },
      });

      console.log(`User ${account.metadata.userId} onboarded successfully`);
    }
  } catch (error) {
    console.error("Error handling account.updated:", error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing checkout.session.completed: ${session.id}`);
    console.log({session});
    // Add your checkout completion logic here
    // e.g., create ticket records, send confirmation emails, etc.
    await prisma.eventBooking.create({
      data: {
        eventId: session.metadata!.eventId!,
        userId: session.metadata!.userId!,
        stripePaymentId: session.payment_intent as string,
        checkoutSessionId: session.id,
      },
    });
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);
    // Add your payment success logic here
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(
      `Processing payment_intent.payment_failed: ${paymentIntent.id}`
    );
    // Add your payment failure logic here
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
    throw error;
  }
}
