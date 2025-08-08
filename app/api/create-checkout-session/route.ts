import { NextResponse } from 'next/server';
import stripe from '../../lib/stripe';
import prisma from '../../lib/db';

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();
    
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get origin for success/cancel URLs
    const origin = request.headers.get('origin');
    if (!origin) {
      throw new Error('Origin header is required');
    }

    // Calculate application fee (10% of the ticket price)
    const amount = Math.round(parseFloat(event.price) * 100); // Convert to cents
    const applicationFeeAmount = Math.round(amount * 0.1); // 10% fee

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: event.hostStripeAccountId, // We'll need to add this field to the Event model
        },
      },
      success_url: `${origin}/guest?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/guest?success=false`,
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
