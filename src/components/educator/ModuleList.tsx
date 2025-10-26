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
} from '@dnd-kit/sortable';
import { ModuleItem } from './ModuleItem';

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

export function ModuleList({
  courseId,
  modules: initialModules,
  onUpdate,
}: {
  courseId: string;
  modules: Module[];
  onUpdate: () => void;
}) {
  const [modules, setModules] = useState(initialModules);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order on server
        updateModuleOrder(
          courseId,
          newItems.map((item, index) => ({ id: item.id, order: index }))
        );

        return newItems;
      });
    }
  };

  const updateModuleOrder = async (
    courseId: string,
    order: Array<{ id: string; order: number }>
  ) => {
    try {
      await fetch(`/api/courses/${courseId}/modules/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } catch (error) {
      console.error('Failed to update module order:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={modules.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleItem
              key={module.id}
              module={module}
              courseId={courseId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
