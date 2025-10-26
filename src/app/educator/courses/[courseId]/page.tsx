import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CourseEditor } from '@/components/educator/CourseEditor';

async function getCourse(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      creatorId: userId,
    },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  return course;
}

export default async function CourseEditorPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'EDUCATOR') {
    redirect('/auth/login');
  }

  const course = await getCourse(params.courseId, session.user.id);

  if (!course) {
    redirect('/educator/courses');
  }

  return <CourseEditor course={course} />;
}
