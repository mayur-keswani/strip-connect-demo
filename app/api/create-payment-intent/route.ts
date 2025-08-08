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

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(event.price) * 100), // Convert to cents
      currency: 'usd',
      // In production, you would set the application_fee_amount
      // application_fee_amount: Math.round(parseFloat(event.price) * 100 * 0.1), // 10% platform fee
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        eventId,
        hostId: 'host_id', // In production, this would be the actual host's ID
      },
      transfer_data: {
        // In production, this would be the host's Stripe Connect account ID
        destination: 'acct_your_connected_account_id',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
