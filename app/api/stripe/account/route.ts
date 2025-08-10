import { NextResponse } from "next/server";
import stripe from "../../../lib/stripe";
import prisma from "../../../lib/db";
import { cookies } from "next/headers";

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, stripeAccountId: true, email: true } });
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * POST /api/stripe/account
 *
 * Creates a new Stripe Express Connect account for the user if one doesn't already exist.
 *
 * @returns {NextResponse} JSON response containing the Stripe account ID.
 */
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin) throw new Error("Missing origin");
    const user = await requireUser();

    // Create an Express account if not exists
    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        email: user.email,
        metadata: { userId: user.id },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/host?onboarding=refresh`,
      return_url: `${origin}/host?onboarding=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ stripeAccountId: accountId, link: link.url });
  } catch (e: any) {
    console.error("Connect account error:", e);
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const user = await requireUser();

    if (!user.stripeAccountId) {
      throw new Error("No connected account");
    }
    console.log("Deleting account:", user);
    const deleted = await stripe.accounts.del(user.stripeAccountId);

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: null },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Delete account error:", e);
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}