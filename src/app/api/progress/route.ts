import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, completed, quizScore } = body;

    // Check if progress already exists
    const existingProgress = await prisma.progress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId,
        },
      },
    });

    const progress = existingProgress
      ? await prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            completed: completed ?? existingProgress.completed,
            completedAt: completed ? new Date() : existingProgress.completedAt,
            quizScore: quizScore ?? existingProgress.quizScore,
            quizAttempts: quizScore
              ? existingProgress.quizAttempts + 1
              : existingProgress.quizAttempts,
          },
        })
      : await prisma.progress.create({
          data: {
            studentId: session.user.id,
            lessonId,
            completed: completed ?? false,
            completedAt: completed ? new Date() : null,
            quizScore,
            quizAttempts: quizScore ? 1 : 0,
          },
        });

    // Update enrollment completion percentage
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: { select: { id: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (lesson) {
      const courseId = lesson.module.courseId;
      const totalLessons = lesson.module.course.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );

      const completedLessons = await prisma.progress.count({
        where: {
          studentId: session.user.id,
          completed: true,
          lesson: {
            module: {
              courseId,
            },
          },
        },
      });

      const completionPercentage = Math.round(
        (completedLessons / totalLessons) * 100
      );

      await prisma.enrollment.update({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId,
          },
        },
        data: {
          completionPercentage,
          completedAt:
            completionPercentage === 100 ? new Date() : null,
        },
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
