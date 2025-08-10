import { NextResponse } from "next/server";
import stripe from "../../../lib/stripe";
import prisma from "../../../lib/db";
import { cookies } from "next/headers";

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId } });
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
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    return NextResponse.json({ stripeAccountId: accountId });
  } catch (e: any) {
    console.error("Connect account error:", e);
    return NextResponse.json({ error: e.message ?? "Failed" }, { status: 500 });
  }
}
