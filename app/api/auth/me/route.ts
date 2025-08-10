import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId');
    
    if (!userId || !userId.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId.value },
      select: {
        id: true,
        email: true,
        name: true,
        stripeAccountId: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
