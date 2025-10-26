import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getCourses(userId: string) {
  return await prisma.course.findMany({
    where: { creatorId: userId },
    include: {
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const courses = await getCourses(session.user.id);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <Link href="/educator/courses/new" className="btn-primary">
          Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first course to start teaching
          </p>
          <Link href="/educator/courses/new" className="btn-primary inline-block">
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/educator/courses/${course.id}`}
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
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{course._count.modules} modules</span>
                <span>{course._count.enrollments} students</span>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    course.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
