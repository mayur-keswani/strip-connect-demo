import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';
import prisma from '../../../lib/db';
import { cookies } from 'next/headers';

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, stripeAccountId: true, email: true } });
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();
    const user = await requireUser();    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: true,
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const origin = request.headers.get("origin");
    if (!origin) {
      return NextResponse.json(
        { error: 'Origin not found' },
        { status: 400 }
      );
    }

    // Calculate application fee (10% of the ticket price)
    const amount = Math.round(event.price * 100); // Convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],      
      metadata: {
        eventId,
        userId: user.id,
        hostId: event.host.id,
      },
      success_url: `${origin}/events?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events?success=false`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
