import { NextResponse } from "next/server";
import prisma from "../../../lib/db";
import { cookies } from "next/headers";
import stripe from "../../../lib/stripe";

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, stripeAccountId: true, email: true },
  });
  if (!user) throw new Error("Unauthorized");
  return user;
}

//update status
export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const eventId = body.eventId;
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        host: true,
      },
    });

    if (event.hostId !== user.id) {
      throw new Error("Unauthorized");
    }

    //fetch today event booking
    const todayEventBooking = await prisma.eventBooking.count({
      where: {
        eventId: eventId,
      },
    });
    const transferAmount = todayEventBooking * ((event.price * 0.9) * 100); //pass only 90% of the price in cents
    console.log("Transfer amount:", transferAmount);
    //transfer amount to host
    const transfer = await stripe.transfers.create({
      amount: transferAmount, //pass only 90% of the price in cents
      currency: "usd",
      destination: event.host.stripeAccountId,
    });

    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: body.status,
      },
    });

    console.log("Transfer created:", transfer);
    return NextResponse.json({ event, transfer }, { status: 201 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
