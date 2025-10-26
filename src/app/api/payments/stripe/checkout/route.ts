import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, discountCode } = body;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { creator: true },
    });

    if (!course || !course.published) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled' },
        { status: 400 }
      );
    }

    let finalPrice = course.price;

    // Apply discount if provided
    if (discountCode) {
      const discount = await prisma.discountCode.findFirst({
        where: {
          code: discountCode,
          courseId: course.id,
          active: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (discount) {
        if (discount.type === 'PERCENTAGE') {
          finalPrice = course.price * (1 - discount.value / 100);
        } else {
          finalPrice = Math.max(0, course.price - discount.value);
        }
      }
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: course.pricingType === 'ONE_TIME' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/student/courses/${course.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}?canceled=true`,
      metadata: {
        courseId: course.id,
        userId: session.user.id,
        discountCode: discountCode || '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
