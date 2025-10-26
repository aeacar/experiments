'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddLessonForm } from './AddLessonForm';
import { LessonList } from './LessonList';

type Module = {
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
};

export function ModuleItem({
  module,
  courseId,
  onUpdate,
}: {
  module: Module;
  courseId: string;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAddLesson, setShowAddLesson] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 border rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-gray-200 p-2 rounded"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{module.title}</h3>
            {module.description && (
              <p className="text-sm text-gray-600">{module.description}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-8 mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowAddLesson(!showAddLesson)}
              className="text-sm btn-primary"
            >
              {showAddLesson ? 'Cancel' : 'Add Lesson'}
            </button>
          </div>

          {showAddLesson && (
            <AddLessonForm
              moduleId={module.id}
              courseId={courseId}
              onSuccess={() => {
                setShowAddLesson(false);
                onUpdate();
              }}
            />
          )}

          {module.lessons.length > 0 && (
            <LessonList
              moduleId={module.id}
              courseId={courseId}
              lessons={module.lessons}
              onUpdate={onUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
}
