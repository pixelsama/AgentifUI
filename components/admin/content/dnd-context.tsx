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

import React, { createContext, useContext, useState } from 'react';

interface DndContextWrapperProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

interface DndStateContextValue {
  isDraggingFromPalette: boolean;
}

const DndStateContext = createContext<DndStateContextValue>({
  isDraggingFromPalette: false,
});

export const useDndState = () => useContext(DndStateContext);

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

  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    // Check if dragging from palette
    const isFromPalette = activeId.startsWith('palette-');
    setIsDraggingFromPalette(isFromPalette);

    console.log('🚀 DND START:', {
      activeId,
      isFromPalette,
      isDraggingFromPalette: isFromPalette,
      activeData: active.data.current,
    });

    setActiveItem({
      id: activeId,
      content: active.data.current?.preview || activeId,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('🏁 DND END:', {
      activeId: event.active.id,
      overId: event.over?.id,
      overData: event.over?.data.current,
      isDraggingFromPalette,
    });

    setActiveItem(null);
    setIsDraggingFromPalette(false);
    onDragEnd(event);
  };

  return (
    <DndStateContext.Provider value={{ isDraggingFromPalette }}>
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
    </DndStateContext.Provider>
  );
}
