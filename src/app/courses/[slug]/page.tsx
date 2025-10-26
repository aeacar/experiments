import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CourseCheckout } from '@/components/student/CourseCheckout';

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      creator: { select: { name: true } },
      modules: {
        include: {
          lessons: {
            select: { id: true, title: true, contentType: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  return course;
}

export default async function CourseLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const course = await getCourse(params.slug);

  if (!course) {
    redirect('/');
  }

  // Check if already enrolled
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      redirect(`/student/courses/${course.id}`);
    }
  }

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-gray-600">By {course.creator.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{course.modules.length} modules</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{totalLessons} lessons</span>
              </div>

              <div className="border-t border-b py-6 mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price}
                  {course.pricingType === 'MONTHLY' && (
                    <span className="text-xl text-gray-600">/month</span>
                  )}
                  {course.pricingType === 'ANNUAL' && (
                    <span className="text-xl text-gray-600">/year</span>
                  )}
                </div>
                <p className="text-gray-600">
                  {course.pricingType === 'ONE_TIME'
                    ? 'One-time payment • Lifetime access'
                    : 'Recurring subscription'}
                </p>
              </div>

              <CourseCheckout courseId={course.id} />

              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Content
                </h2>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        Module {index + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {module.description}
                        </p>
                      )}
                      <ul className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <span>
                              {lesson.contentType === 'VIDEO' && '🎥'}
                              {lesson.contentType === 'AUDIO' && '🎵'}
                              {lesson.contentType === 'PDF' && '📄'}
                              {lesson.contentType === 'TEXT' && '📝'}
                              {lesson.contentType === 'QUIZ' && '❓'}
                            </span>
                            {lesson.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
