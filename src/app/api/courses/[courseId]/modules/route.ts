import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'EDUCATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: params.courseId,
        creatorId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description } = body;

    // Get the highest order number
    const lastModule = await prisma.module.findFirst({
      where: { courseId: params.courseId },
      orderBy: { order: 'desc' },
    });

    const order = (lastModule?.order ?? -1) + 1;

    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        order,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Module creation error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
