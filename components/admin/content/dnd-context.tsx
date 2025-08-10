'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';

import React, { useState } from 'react';

interface DndContextWrapperProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

/**
 * DndKit Context Wrapper
 *
 * Provides drag and drop context using @dnd-kit/core
 * Replaces react-beautiful-dnd's DragDropContext
 */
export function DndContextWrapper({
  children,
  onDragEnd,
}: DndContextWrapperProps) {
  const [activeItem, setActiveItem] = useState<{
    id: string;
    content: React.ReactNode;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveItem({
      id: String(active.id),
      content: active.data.current?.preview || String(active.id),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    onDragEnd(event);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeItem ? (
              <div className="rounded-lg border bg-white p-2 shadow-lg dark:bg-gray-800">
                {activeItem.content}
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
