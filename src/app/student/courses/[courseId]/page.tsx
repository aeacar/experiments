import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CoursePlayer } from '@/components/student/CoursePlayer';

async function getCourseWithProgress(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quiz: {
                include: {
                  questions: {
                    include: {
                      options: true,
                    },
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Get progress for all lessons
  const progress = await prisma.progress.findMany({
    where: {
      studentId: userId,
      lesson: {
        module: {
          courseId,
        },
      },
    },
  });

  return { course, enrollment, progress };
}

export default async function StudentCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const data = await getCourseWithProgress(params.courseId, session.user.id);

  if (!data) {
    redirect('/student/dashboard');
  }

  return (
    <CoursePlayer
      course={data.course}
      enrollment={data.enrollment}
      progressRecords={data.progress}
      userId={session.user.id}
    />
  );
}
