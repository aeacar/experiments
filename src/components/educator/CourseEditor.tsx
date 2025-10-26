'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleList } from './ModuleList';
import { AddModuleForm } from './AddModuleForm';

type Course = {
  id: string;
  title: string;
  description: string;
  pricingType: string;
  price: number;
  published: boolean;
  modules: Array<{
    id: string;
    title: string;
    description: string | null;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      contentType: string;
      order: number;
      dripDays: number | null;
    }>;
  }>;
};

export function CourseEditor({ course: initialCourse }: { course: Course }) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [showAddModule, setShowAddModule] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePublishToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !course.published }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCourse(updated);
      }
    } catch (error) {
      console.error('Failed to update course:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCourse = () => {
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePublishToggle}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                course.published
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading
                ? 'Updating...'
                : course.published
                ? 'Unpublish'
                : 'Publish Course'}
            </button>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">
            Price: ${course.price} ({course.pricingType.replace('_', ' ')})
          </span>
          <span
            className={`px-3 py-1 rounded-full ${
              course.published
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {course.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Course Content</h2>
          <button
            onClick={() => setShowAddModule(!showAddModule)}
            className="btn-primary"
          >
            {showAddModule ? 'Cancel' : 'Add Module'}
          </button>
        </div>

        {showAddModule && (
          <AddModuleForm
            courseId={course.id}
            onSuccess={() => {
              setShowAddModule(false);
              refreshCourse();
            }}
          />
        )}

        {course.modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              No modules yet. Add your first module to get started.
            </p>
          </div>
        ) : (
          <ModuleList
            courseId={course.id}
            modules={course.modules}
            onUpdate={refreshCourse}
          />
        )}
      </div>
    </div>
  );
}
