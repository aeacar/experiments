import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getEnrollments(userId: string) {
  return await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: {
        include: {
          creator: { select: { name: true } },
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const enrollments = await getEnrollments(session.user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Browse and enroll in courses to start learning
          </p>
          <Link href="/" className="btn-primary inline-block">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ course, completionPercentage }) => {
            const totalLessons = course.modules.reduce(
              (acc, module) => acc + module.lessons.length,
              0
            );

            return (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  By {course.creator.name}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {totalLessons} lessons
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
