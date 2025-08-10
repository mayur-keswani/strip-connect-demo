import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { email } });
  
    if (!user) {
      // throw error
      throw new Error('User not found');
    }

    //decrypt password
    const decryptedPassword = bcrypt.compareSync(password, user?.password);
    if (!decryptedPassword) {
      throw new Error('Incorrect password');
    }
    
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, stripeAccountId: user.stripeAccountId });
    res.cookies.set('userId', user.id, { httpOnly: true, path: '/' });
    return res;
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: e.message ?? 'Login failed' }, { status: 500 });
  }
}