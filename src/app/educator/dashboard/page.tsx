import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getDashboardData(userId: string) {
  const [courses, totalRevenue, totalStudents, recentEnrollments] = await Promise.all([
    prisma.course.count({
      where: { creatorId: userId },
    }),
    prisma.payment.aggregate({
      where: {
        user: {
          coursesCreated: {
            some: { creatorId: userId },
          },
        },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
    prisma.enrollment.count({
      where: {
        course: { creatorId: userId },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        course: { creatorId: userId },
      },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    courses,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalStudents,
    recentEnrollments,
  };
}

export default async function EducatorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/educator/courses/new" className="btn-primary">
          Create New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            ${data.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Students</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {data.totalStudents}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Courses</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {data.courses}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Enrollments</h2>
        {data.recentEnrollments.length === 0 ? (
          <p className="text-gray-500">No enrollments yet</p>
        ) : (
          <div className="space-y-4">
            {data.recentEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex justify-between items-center border-b pb-3 last:border-b-0"
              >
                <div>
                  <div className="font-medium">{enrollment.student.name}</div>
                  <div className="text-sm text-gray-500">{enrollment.course.title}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
