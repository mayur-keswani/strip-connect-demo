import { NextResponse } from 'next/server';
import stripe from '../../../lib/stripe';
import prisma from '../../../lib/db';
import { cookies } from 'next/headers';

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.stripeAccountId) {
      return NextResponse.json({ error: 'No connected account' }, { status: 400 });
    }

    const origin = request.headers.get('origin');
    if (!origin) throw new Error('Missing origin');

    const link = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${origin}/host?onboarding=refresh`,
      return_url: `${origin}/host?onboarding=return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url });
  } catch (e: any) {
    console.error('Account link error:', e);
    return NextResponse.json({ error: e.message ?? 'Failed' }, { status: 500 });
  }
}
