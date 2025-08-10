import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    let user = await prisma.user.findUnique({ where: { email } });
  
    if (user) {
      // throw error
      throw new Error('User already exists with this email');
    }

    //decrypt password
    const decryptedPassword = bcrypt.hashSync(password, 10);
   
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: decryptedPassword,
        stripeAccountId: "",
      }
    });
    
    const res = NextResponse.json({ id: newUser.id, email: newUser.email, name: newUser.name, stripeAccountId: newUser.stripeAccountId });
    res.cookies.set('userId', newUser.id, { httpOnly: true, path: '/' });
    return res;
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: e.message ?? 'Login failed' }, { status: 500 });
  }
}