'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  order: number;
  dripDays: number | null;
};

function LessonItem({ lesson }: { lesson: Lesson }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentTypeIcons: Record<string, string> = {
    VIDEO: '🎥',
    AUDIO: '🎵',
    PDF: '📄',
    TEXT: '📝',
    QUIZ: '❓',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded p-3 flex items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-gray-100 p-1 rounded"
      >
        <svg
          className="w-4 h-4 text-gray-400"
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
      <span className="text-xl">{contentTypeIcons[lesson.contentType]}</span>
      <div className="flex-1">
        <div className="font-medium">{lesson.title}</div>
        {lesson.description && (
          <div className="text-sm text-gray-500">{lesson.description}</div>
        )}
      </div>
      {lesson.dripDays !== null && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          Drip: Day {lesson.dripDays}
        </span>
      )}
    </div>
  );
}

export function LessonList({
  moduleId,
  courseId,
  lessons: initialLessons,
  onUpdate,
}: {
  moduleId: string;
  courseId: string;
  lessons: Lesson[];
  onUpdate: () => void;
}) {
  const [lessons, setLessons] = useState(initialLessons);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order on server
        updateLessonOrder(
          courseId,
          moduleId,
          newItems.map((item, index) => ({ id: item.id, order: index }))
        );

        return newItems;
      });
    }
  };

  const updateLessonOrder = async (
    courseId: string,
    moduleId: string,
    order: Array<{ id: string; order: number }>
  ) => {
    try {
      await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } catch (error) {
      console.error('Failed to update lesson order:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
