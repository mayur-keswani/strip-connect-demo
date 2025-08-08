# Event Booking with Stripe Connect Demo

A Next.js application demonstrating event booking with Stripe Payments and Connect integration.

## Features

- Host can create events and set ticket prices
- Guests can view events and book tickets
- Payments are processed through Stripe
- Funds are held until event completion
- Automatic payout to hosts after event completion

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with your Stripe API keys:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

- `/host` - Event creation interface for hosts
- `/guest` - Event booking interface for guests

## Important Notes

- This is a demo application using in-memory storage. In production, use a proper database
- Stripe Connect integration requires setting up Connect accounts for hosts
- Test mode uses test API keys and test card numbers (e.g., 4242 4242 4242 4242)
