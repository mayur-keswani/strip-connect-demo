import { NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { cookies } from 'next/headers';

async function requireUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, stripeAccountId: true, email: true } });
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function GET() {
  try {
    const user = await requireUser();
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc'
      },
    });

    // Check if user has booked each event
    const eventsWithBookingStatus = await Promise.all(
      events.map(async (event) => {
        const booking = await prisma.eventBooking.findFirst({
          where: {
            eventId: event.id,
            userId: user.id
          }
        });
        
        return {
          ...event,
          isBooked: !!booking
        };
      })
    );
    
    return NextResponse.json(eventsWithBookingStatus);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const newEvent = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        hostId: user.id,
        date: new Date(body.date)
      }
    });
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
